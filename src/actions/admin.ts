"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
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