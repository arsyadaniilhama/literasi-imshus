import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { ReviewWorkspace } from "@/components/review/ReviewWorkspace";
import type { ReviewCommentType, ReviewCommentStatus } from "@/types";

// ============================================================
// Halaman Review Artikel Guru (CRITICAL)
// ============================================================

export default async function ReviewArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireTeacher();

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
      current_revision: true,
      reviews: {
        orderBy: { created_at: "desc" },
        include: {
          comments: {
            orderBy: { created_at: "asc" },
          },
        },
      },
    },
  });

  if (!article || !article.current_revision) notFound();

  // Ambil review yang aktif (PENDING / IN_REVIEW)
  const activeReview = article.reviews.find(
    (r) => r.decision === "PENDING" || r.decision === "IN_REVIEW"
  );

  // Jika sudah direview (APPROVED / REVISION_REQUIRED), kembali ke dasbor
  if (!activeReview) redirect("/dashboard/teacher");

  const revision = article.current_revision;

  // Serialisasi komentar untuk client component
  const comments = activeReview.comments.map((c) => ({
    id: c.id,
    review_id: c.review_id,
    article_id: c.article_id,
    revision_id: c.revision_id,
    reviewer_id: c.reviewer_id,
    selected_text: c.selected_text,
    comment: c.comment,
    type: c.type as ReviewCommentType,
    start_position: c.start_position as { pos?: number } | null,
    end_position: c.end_position as { pos?: number } | null,
    status: c.status as ReviewCommentStatus,
    created_at: c.created_at.toISOString(),
    resolved_at: c.resolved_at?.toISOString() ?? null,
  }));

  return (
    <ReviewWorkspace
      articleId={article.id}
      articleTitle={article.title}
      authorName={article.author?.name ?? "Santri"}
      categoryName={article.category?.name ?? null}
      revisionContent={revision.content}
      reviewId={activeReview.id}
      generalComment={activeReview.general_comment}
      initialComments={comments}
    />
  );
}
