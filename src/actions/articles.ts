"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent, requireUser } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createArticleSchema } from "@/lib/validations";
import type { ActionResult, ArticleStatus } from "@/types";

const DRAFT_STATUS: ArticleStatus = "DRAFT";

/**
 * Simpan artikel sebagai DRAFT (atau update draft yang ada).
 * Tidak membuat revision baru.
 */
export async function saveDraft(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();

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
  const articleId = raw.article_id ? String(raw.article_id) : undefined;

  try {
    if (articleId) {
      // Pastikan artikel milik user & masih editable (DRAFT / REVISION_REQUIRED)
      const existing = await prisma.article.findFirst({
        where: {
          id: articleId,
          author_id: user.id,
          status: { in: ["DRAFT", "REVISION_REQUIRED"] },
        },
        include: { current_revision: { select: { id: true } } },
      });
      if (!existing) {
        return { success: false, error: "Artikel tidak ditemukan atau tidak dapat diedit." };
      }
      // Update artikel utama
      await prisma.article.update({
        where: { id: articleId },
        data: {
          title: data.title,
          category_id: data.category_id ?? null,
          excerpt: data.excerpt ?? null,
          cover_image_url: data.cover_image_url ?? null,
        },
      });
      // Update content pada current_revision agar draft berikutnya tidak kehilangan konten
      if (existing.current_revision_id) {
        await prisma.articleRevision.update({
          where: { id: existing.current_revision_id },
          data: {
            title: data.title,
            excerpt: data.excerpt ?? null,
            content: data.content,
            content_json: (data.content_json as object) ?? {},
            cover_image_url: data.cover_image_url ?? null,
          },
        });
      }
      revalidatePath("/dashboard/student");
      return { success: true };
    } else {
      // Buat artikel baru + revision pertama
      const article = await prisma.article.create({
        data: {
          author_id: user.id,
          title: data.title,
          category_id: data.category_id ?? null,
          excerpt: data.excerpt ?? null,
          cover_image_url: data.cover_image_url ?? null,
          status: DRAFT_STATUS,
          revisions: {
            create: {
              revision_number: 1,
              title: data.title,
              excerpt: data.excerpt ?? null,
              content: data.content,
              content_json: (data.content_json as object) ?? {},
              cover_image_url: data.cover_image_url ?? null,
              created_by: user.id,
            },
          },
        },
        include: { revisions: true },
      });
      // Simpan current_revision_id
      await prisma.article.update({
        where: { id: article.id },
        data: { current_revision_id: article.revisions[0]?.id },
      });
      revalidatePath("/dashboard/student");
      redirect(`/dashboard/student/articles/${article.id}/edit`);
    }
  } catch (error) {
    // Jangan menelan error framework Next.js (NEXT_REDIRECT dari redirect())
    unstable_rethrow(error);
    console.error("saveDraft error:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan artikel." };
  }
}

/**
 * Submit artikel untuk review — membuat revision baru & mengubah status jadi SUBMITTED.
 * Membuat record review PENDING.
 */
export async function submitArticle(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();

  const raw = Object.fromEntries(formData);
  const articleId = String(raw.article_id);
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

  // Pastikan artikel milik user & bisa di-submit
  const existing = await prisma.article.findFirst({
    where: {
      id: articleId,
      author_id: user.id,
      status: { in: ["DRAFT", "REVISION_REQUIRED"] },
    },
  });
  if (!existing) {
    return { success: false, error: "Artikel tidak ditemukan atau sedang dalam proses review." };
  }

  const data = parsed.data;

  try {
    // Buat revision baru
    const lastRev = await prisma.articleRevision.findFirst({
      where: { article_id: articleId },
      orderBy: { revision_number: "desc" },
    });
    const nextNumber = (lastRev?.revision_number ?? 0) + 1;

    const result = await prisma.$transaction(async (tx) => {
      const revision = await tx.articleRevision.create({
        data: {
          article_id: articleId,
          revision_number: nextNumber,
          title: data.title,
          excerpt: data.excerpt ?? null,
          content: data.content,
          content_json: (data.content_json as object) ?? {},
          cover_image_url: data.cover_image_url ?? null,
          created_by: user.id,
        },
      });

      const article = await tx.article.update({
        where: { id: articleId },
        data: {
          title: data.title,
          slug: existing.slug ?? null,
          excerpt: data.excerpt ?? null,
          cover_image_url: data.cover_image_url ?? null,
          category_id: data.category_id ?? null,
          status: "SUBMITTED",
          current_revision_id: revision.id,
        },
      });

      // Review record
      const review = await tx.review.create({
        data: {
          article_id: articleId,
          revision_id: revision.id,
          reviewer_id: null, // diisi saat guru mengambil review
          decision: "PENDING",
        },
      });

      // Notifikasi
      await tx.notification.create({
        data: {
          user_id: user.id,
          type: "ARTICLE_SUBMITTED",
          title: "Artikel dikirim",
          message: `Artikel "${data.title}" berhasil dikirim untuk review.`,
          article_id: articleId,
        },
      });

      return { article, review };
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "STUDENT_SUBMITTED_ARTICLE",
        entity_type: "article",
        entity_id: articleId,
        metadata: { title: data.title },
      },
    });

    revalidatePath("/dashboard/student");
    return { success: true, data: { id: result.article.id } };
  } catch (error) {
    console.error("submitArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengirim artikel." };
  }
}

/**
 * Hapus draft milik user.
 */
export async function deleteArticle(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  const articleId = String(formData.get("article_id"));

  const existing = await prisma.article.findFirst({
    where: { id: articleId, author_id: user.id },
  });
  if (!existing) {
    return { success: false, error: "Artikel tidak ditemukan." };
  }
  if (existing.status !== "DRAFT" && existing.status !== "REVISION_REQUIRED") {
    return { success: false, error: "Artikel yang sedang direview atau sudah dipublikasikan tidak dapat dihapus." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Lepas current_revision_id agar FK articles_current_revision_id_fkey (NO ACTION)
      //    tidak menghalangi penghapusan revisi di bawah.
      await tx.article.update({
        where: { id: articleId },
        data: { current_revision_id: null },
      });
      // 2. Hapus notifikasi terkait artikel
      await tx.notification.deleteMany({ where: { article_id: articleId } });
      // 3. Hapus review comments yang berhubungan
      await tx.reviewComment.deleteMany({ where: { article_id: articleId } });
      await tx.review.deleteMany({ where: { article_id: articleId } });
      // 4. Hapus revisi (aman — current_revision_id sudah dilepas)
      await tx.articleRevision.deleteMany({ where: { article_id: articleId } });
      await tx.article.delete({ where: { id: articleId } });
    });
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("deleteArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus artikel." };
  }
}

/**
 * Upload gambar cover artikel ke Supabase Storage (bucket `article-covers`).
 */
export async function uploadCoverImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  await requireUser();

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "File gambar tidak ditemukan." };
  }

  // Maksimal 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Ukuran gambar maksimal 5MB." };
  }

  // Validasi format file
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      error: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.",
    };
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("article-covers")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("uploadCoverImage storage error:", uploadError);
      return { success: false, error: "Gagal mengunggah gambar ke storage." };
    }

    const { data: pubUrl } = supabaseAdmin.storage
      .from("article-covers")
      .getPublicUrl(filename);

    return {
      success: true,
      data: { url: pubUrl.publicUrl },
    };
  } catch (error) {
    console.error("uploadCoverImage error:", error);
    return { success: false, error: "Terjadi kesalahan saat mengunggah gambar." };
  }
}
