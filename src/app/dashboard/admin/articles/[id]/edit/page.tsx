import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import type { ArticleStatus } from "@/types";
import { AdminArticleEditClient } from "./AdminArticleEditClient";

// ============================================================
// Halaman Edit Konten Artikel — Admin (fix typo, dll.)
// ============================================================

export default async function AdminEditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();

  const article = await prisma.article.findFirst({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      current_revision: true,
    },
  });

  if (!article) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AdminArticleEditClient
      articleId={article.id}
      title={article.title}
      excerpt={article.excerpt ?? ""}
      coverImageUrl={article.cover_image_url ?? ""}
      categoryId={article.category_id ?? ""}
      content={article.current_revision?.content ?? ""}
      contentJson={
        (article.current_revision?.content_json as Record<string, unknown>) ?? {}
      }
      status={article.status as ArticleStatus}
      slug={article.slug}
      categories={categories}
    />
  );
}
