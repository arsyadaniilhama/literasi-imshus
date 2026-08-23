"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth/session";
import { reviewCommentSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

/**
 * Guru mulai mereview artikel — set status UNDER_REVIEW & review decision IN_REVIEW.
 * Returns review_id.
 */
export async function startReview(formData: FormData): Promise<ActionResult> {
  const user = await requireTeacher();
  const articleId = String(formData.get("article_id"));

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { reviews: { orderBy: { created_at: "desc" }, take: 1 } },
    });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    // Ambil review PENDING terbaru, atau buat baru
    let review = article.reviews.find((r) => r.decision === "PENDING" || r.decision === "IN_REVIEW");
    if (!review) {
      const lastRev = await prisma.articleRevision.findFirst({
        where: { article_id: articleId },
        orderBy: { revision_number: "desc" },
      });
      if (!lastRev) return { success: false, error: "Artikel belum memiliki konten." };
      review = await prisma.review.create({
        data: {
          article_id: articleId,
          revision_id: lastRev.id,
          reviewer_id: user.id,
          decision: "IN_REVIEW",
        },
      });
    } else {
      review = await prisma.review.update({
        where: { id: review.id },
        data: { reviewer_id: user.id, decision: "IN_REVIEW" },
      });
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: "UNDER_REVIEW" },
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "TEACHER_STARTED_REVIEW",
        entity_type: "article",
        entity_id: articleId,
      },
    });

    revalidatePath("/dashboard/teacher");
    return { success: true, data: { review_id: review.id } };
  } catch (error) {
    console.error("startReview error:", error);
    return { success: false, error: "Terjadi kesalahan saat memulai review." };
  }
}

/**
 * Guru membuat komentar highlight pada artikel.
 */
export async function createReviewComment(formData: FormData): Promise<ActionResult> {
  const user = await requireTeacher();

  const raw = Object.fromEntries(formData);
  const parsed = reviewCommentSchema.safeParse({
    selected_text: raw.selected_text,
    comment: raw.comment,
    type: raw.type,
    start_position: raw.start_position ? JSON.parse(String(raw.start_position)) : {},
    end_position: raw.end_position ? JSON.parse(String(raw.end_position)) : {},
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const articleId = String(raw.article_id);
  const reviewId = String(raw.review_id);

  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article || !article.current_revision_id) {
      return { success: false, error: "Artikel tidak ditemukan." };
    }

    const comment = await prisma.reviewComment.create({
      data: {
        review_id: reviewId,
        article_id: articleId,
        revision_id: article.current_revision_id,
        reviewer_id: user.id,
        selected_text: parsed.data.selected_text,
        comment: parsed.data.comment,
        type: parsed.data.type,
        start_position: parsed.data.start_position,
        end_position: parsed.data.end_position,
        status: "OPEN",
      },
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "TEACHER_CREATED_COMMENT",
        entity_type: "review_comment",
        entity_id: comment.id,
      },
    });

    revalidatePath(`/dashboard/teacher/reviews/${articleId}`);
    return { success: true, data: { comment_id: comment.id } };
  } catch (error) {
    console.error("createReviewComment error:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan komentar." };
  }
}

/**
 * Guru meminta revisi — artikel menjadi REVISION_REQUIRED, santri dapat mengedit.
 */
export async function requestRevision(formData: FormData): Promise<ActionResult> {
  const user = await requireTeacher();
  const articleId = String(formData.get("article_id"));
  const reviewId = String(formData.get("review_id"));
  const generalComment = (formData.get("general_comment") as string) || null;

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        comments: { where: { review_id: reviewId } },
        author: true,
      },
    });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    // PRD: tidak boleh request revision tanpa komentar/alasan
    if (!generalComment && article.comments.length === 0) {
      return {
        success: false,
        error: "Tambahkan minimal satu komentar atau alasan umum sebelum meminta revisi.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: { decision: "REVISION_REQUIRED", general_comment: generalComment, completed_at: new Date() },
      });
      await tx.article.update({
        where: { id: articleId },
        data: { status: "REVISION_REQUIRED" },
      });
      await tx.notification.create({
        data: {
          user_id: article.author_id,
          type: "REVISION_REQUIRED",
          title: "Artikel perlu direvisi",
          message: `Guru memberikan ${article.comments.length} catatan pada artikel "${article.title}".`,
          article_id: articleId,
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "TEACHER_REQUESTED_REVISION",
        entity_type: "article",
        entity_id: articleId,
        metadata: { comment_count: article.comments.length },
      },
    });

    revalidatePath("/dashboard/teacher");
    return { success: true };
  } catch (error) {
    console.error("requestRevision error:", error);
    return { success: false, error: "Terjadi kesalahan saat meminta revisi." };
  }
}

/**
 * Guru approve artikel — artikel menjadi PUBLISHED (MVP).
 */
export async function approveArticle(formData: FormData): Promise<ActionResult> {
  const user = await requireTeacher();
  const articleId = String(formData.get("article_id"));
  const reviewId = String(formData.get("review_id"));

  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true },
    });
    if (!article) return { success: false, error: "Artikel tidak ditemukan." };

    // Generate slug unik
    let baseSlug = slugify(article.title) || `artikel-${article.id.slice(0, 6)}`;
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: { decision: "APPROVED", completed_at: new Date() },
      });
      await tx.article.update({
        where: { id: articleId },
        data: {
          status: "PUBLISHED",
          slug,
          published_at: new Date(),
        },
      });
      await tx.notification.create({
        data: {
          user_id: article.author_id,
          type: "ARTICLE_PUBLISHED",
          title: "Artikel dipublikasikan! 🎉",
          message: `Artikel "${article.title}" telah disetujui dan dipublikasikan.`,
          article_id: articleId,
        },
      });
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "TEACHER_APPROVED_ARTICLE",
        entity_type: "article",
        entity_id: articleId,
      },
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("approveArticle error:", error);
    return { success: false, error: "Terjadi kesalahan saat menyetujui artikel." };
  }
}
