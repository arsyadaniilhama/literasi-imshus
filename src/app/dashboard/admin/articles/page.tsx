import { prisma } from "@/lib/prisma";
import { AdminArticlesTable } from "./articles-table";
import type { ArticleStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      orderBy: { created_at: "desc" },
      include: {
        author: { select: { id: true, name: true, avatar_url: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedArticles = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    cover_image_url: a.cover_image_url,
    status: a.status as ArticleStatus,
    published_at: a.published_at?.toISOString() ?? null,
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
    author: {
      id: a.author.id,
      name: a.author.name,
      avatar_url: a.author.avatar_url,
    },
    category: a.category
      ? {
          id: a.category.id,
          name: a.category.name,
          slug: a.category.slug,
        }
      : null,
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Artikel</h1>
          <p className="text-muted-foreground">
            Kelola semua artikel dari seluruh santri
          </p>
        </div>
      </div>

      <AdminArticlesTable
        articles={serializedArticles}
        categories={serializedCategories}
      />
    </div>
  );
}