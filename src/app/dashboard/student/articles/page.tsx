import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/session";
import { StudentArticlesTable } from "./articles-table";
import type { ArticleStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StudentArticlesPage() {
  const user = await requireStudent();

  const articles = await prisma.article.findMany({
    where: { author_id: user.id },
    orderBy: { updated_at: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      current_revision: { select: { content: true } },
    },
  });

  const serializedArticles = articles.map((a) => {
    const wordCount = a.current_revision
      ? a.current_revision.content
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .split(" ")
          .filter(Boolean).length
      : 0;

    return {
      id: a.id,
      title: a.title,
      status: a.status as ArticleStatus,
      category: a.category
        ? {
            id: a.category.id,
            name: a.category.name,
            slug: a.category.slug,
          }
        : null,
      word_count: wordCount,
      created_at: a.created_at.toISOString(),
      updated_at: a.updated_at.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Artikel Saya
          </h1>
          <p className="text-muted-foreground">
            Kelola dan pantau status semua tulisan Anda
          </p>
        </div>
      </div>

      <StudentArticlesTable
        articles={serializedArticles}
      />
    </div>
  );
}
