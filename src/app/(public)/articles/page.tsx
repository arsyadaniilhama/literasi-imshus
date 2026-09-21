import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Search, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Artikel",
  description: "Daftar artikel publik dari santri IMSHUS Isy Karima.",
};

const PAGE_SIZE = 9;

async function getArticles({ query, page }: { query: string; page: number }) {
  const where = {
    status: "PUBLISHED" as const,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { published_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { id: true, name: true, avatar_url: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { articles, total, totalPages } = await getArticles({ query: q, page });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Artikel</h1>
          <p className="mt-2 text-muted-foreground">
            {total > 0
              ? `${total} artikel dipublikasikan`
              : "Belum ada artikel dipublikasikan"}
          </p>
        </div>
        <form action="/articles" method="GET" className="flex w-full max-w-sm gap-2 sm:shrink-0">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari artikel..."
              className="h-10 rounded-full bg-card pl-10 ring-1 ring-primary/10"
              aria-label="Cari artikel"
            />
          </div>
          <Button type="submit" className="h-10 rounded-full">
            Cari
          </Button>
        </form>
      </div>

      {articles.length === 0 ? (
        <Card className="mt-10">
          <CardContent className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
            <h2 className="text-lg font-medium">
              {q ? `Tidak ada hasil untuk "${q}"` : "Belum ada artikel"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {q ? "Coba kata kunci lain atau jelajahi semua artikel." : "Nantikan tulisan santri kami."}
            </p>
            {q && (
              <Link href="/articles" className="mt-4 inline-block">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Semua Artikel
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Navigasi halaman">
          {page > 1 && (
            <Link
              href={`/articles?${new URLSearchParams(q ? { q, page: String(page - 1) } : { page: String(page - 1) })}`}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Sebelumnya
            </Link>
          )}
          <span className="px-2 text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/articles?${new URLSearchParams(q ? { q, page: String(page + 1) } : { page: String(page + 1) })}`}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              Berikutnya
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
