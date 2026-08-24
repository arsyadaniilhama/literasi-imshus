"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createArticleSchema } from "@/lib/validations";
import type { ActionResult, ArticleStatus } from "@/types";

/**
 * Admin: ubah status artikel.
 */
export async function updateArticleStatus(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const articleId = String(formData.get("article_id"));
  const status = String(formData.get("status")) as ArticleStatus;

  const allowedStatuses: ArticleStatus[] = [
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED",
    "APPROVED", "PUBLISHED", "ARCHIVED",
  ];
  if (!allowedStatuses.includes(status)) {
    return { success: false, error: "Status tidak valid." };
  }

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        published_at: status === "PUBLISHED" ? new Date() : article.published_at,
      },
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_UPDATED_ARTICLE_STATUS",
        entity_type: "article",
        entity_id: articleId,
        metadata: { old_status: article.status, new_status: status },
      },
    });

    revalidatePath("/dashboard/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("updateArticleStatus error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengubah status artikel." };
  }
}

/**
 * Admin: arsipkan artikel.
 */
export async function archiveArticle(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const articleId = String(formData.get("article_id"));

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    await prisma.article.update({
      where: { id: articleId },
      data: { status: "ARCHIVED" },
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_ARCHIVED_ARTICLE",
        entity_type: "article",
        entity_id: articleId,
        metadata: { title: article.title },
      },
    });

    revalidatePath("/dashboard/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("archiveArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengarsipkan artikel." };
  }
}

/**
 * Admin: hapus artikel beserta seluruh relasinya.
 */
export async function deleteArticle(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const articleId = String(formData.get("article_id"));

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    await prisma.$transaction(async (tx) => {
      // Lepas current_revision_id dulu agar FK articles_current_revision_id_fkey (NO ACTION)
      // tidak menghalangi penghapusan revisi di bawah.
      await tx.article.update({
        where: { id: articleId },
        data: { current_revision_id: null },
      });
      await tx.notification.deleteMany({ where: { article_id: articleId } });
      await tx.reviewComment.deleteMany({ where: { article_id: articleId } });
      await tx.review.deleteMany({ where: { article_id: articleId } });
      await tx.articleRevision.deleteMany({ where: { article_id: articleId } });
      await tx.article.delete({ where: { id: articleId } });
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_DELETED_ARTICLE",
        entity_type: "article",
        entity_id: articleId,
        metadata: { title: article.title },
      },
    });

    revalidatePath("/dashboard/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("deleteArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus artikel." };
  }
}

/**
 * Admin: ubah kategori artikel.
 */
export async function updateArticleCategory(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const articleId = String(formData.get("article_id"));
  const categoryIdRaw = formData.get("category_id");
  const categoryId = categoryIdRaw && typeof categoryIdRaw === "string" && categoryIdRaw.trim()
    ? categoryIdRaw.trim()
    : null;

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    await prisma.article.update({
      where: { id: articleId },
      data: { category_id: categoryId },
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_UPDATED_ARTICLE_CATEGORY",
        entity_type: "article",
        entity_id: articleId,
      },
    });

    revalidatePath("/dashboard/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("updateArticleCategory error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengubah kategori artikel." };
  }
}

/**
 * Admin: edit konten artikel (judul, konten, excerpt, cover, kategori).
 * Membuat ArticleRevision baru & memperbarui current_revision_id.
 * Status & slug artikel TETAP (tidak diubah).
 */
export async function adminUpdateArticle(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const articleId = String(formData.get("article_id"));

  const raw = Object.fromEntries(formData);
  const parsed = createArticleSchema.safeParse({
    title: raw.title,
    content: raw.content,
    content_json: raw.content_json ? JSON.parse(String(raw.content_json)) : undefined,
    category_id: raw.category_id || null,
    excerpt: raw.excerpt || undefined,
    cover_image_url: raw.cover_image_url || null,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    // Cari revision terakhir untuk increment number
    const lastRev = await prisma.articleRevision.findFirst({
      where: { article_id: articleId },
      orderBy: { revision_number: "desc" },
    });
    const nextNumber = (lastRev?.revision_number ?? 0) + 1;

    await prisma.$transaction(async (tx) => {
      // Buat revision baru
      const revision = await tx.articleRevision.create({
        data: {
          article_id: articleId,
          revision_number: nextNumber,
          title: data.title,
          excerpt: data.excerpt ?? null,
          content: data.content,
          content_json: (data.content_json as object) ?? {},
          cover_image_url: data.cover_image_url ?? null,
          created_by: admin.id,
        },
      });

      // Update artikel — status & slug TETAP
      await tx.article.update({
        where: { id: articleId },
        data: {
          title: data.title,
          excerpt: data.excerpt ?? null,
          cover_image_url: data.cover_image_url ?? null,
          category_id: data.category_id ?? null,
          current_revision_id: revision.id,
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        user_id: admin.id,
        action: "ADMIN_UPDATED_ARTICLE_CONTENT",
        entity_type: "article",
        entity_id: articleId,
        metadata: { title: data.title, revision: nextNumber },
      },
    });

    revalidatePath("/dashboard/admin/articles");
    if (article.slug) revalidatePath(`/articles/${article.slug}`);
    return { success: true };
  } catch (error) {
    console.error("adminUpdateArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengupdate artikel." };
  }
}

/**
 * Admin: update kategori (nama, description).
 */
export async function updateCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const categoryId = String(formData.get("category_id"));
  const name = String(formData.get("name") || "").trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { success: false, error: "Nama kategori harus diisi." };

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `kategori-${Date.now()}`;
    await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug, description },
    });
    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("updateCategory error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengupdate kategori." };
  }
}