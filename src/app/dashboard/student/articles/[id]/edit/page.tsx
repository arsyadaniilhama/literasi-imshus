import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import type { ArticleStatus } from "@/types";
import { ArticleEditClient } from "./ArticleEditClient";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStudent();

  const article = await prisma.article.findFirst({
    where: { id, author_id: user.id },
    include: {
      category: { select: { id: true, name: true } },
      current_revision: true,
      reviews: {
        where: { decision: "REVISION_REQUIRED" },
        orderBy: { created_at: "desc" },
        take: 1,
        include: {
          reviewer: { select: { name: true } },
          comments: { orderBy: { created_at: "asc" } },
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const isEditable = ["DRAFT", "REVISION_REQUIRED"].includes(article.status);

  return (
    <ArticleEditClient
      articleId={article.id}
      title={article.title}
      excerpt={article.excerpt ?? ""}
      coverImageUrl={article.cover_image_url ?? ""}
      categoryId={article.category_id ?? ""}
      content={article.current_revision?.content ?? ""}
      contentJson={(article.current_revision?.content_json as Record<string, unknown>) ?? {}}
      status={article.status as ArticleStatus}
      createdAt={article.created_at.toISOString()}
      updatedAt={article.updated_at.toISOString()}
      slug={article.slug}
      authorName={user.name}
      categories={categories}
      isEditable={isEditable}
      reviews={article.reviews.map((review) => ({
        id: review.id,
        generalComment: review.general_comment,
        reviewerName: review.reviewer?.name ?? "Guru",
        comments: review.comments.map((comment) => ({
          id: comment.id,
          type: comment.type,
          selectedText: comment.selected_text,
          comment: comment.comment,
          status: comment.status,
        })),
      }))}
    />
  );
}