import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArrowLeft, BookOpen, Tag } from "lucide-react";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
      take: 100,
    });
    return categories
      .filter((c) => Boolean(c.slug))
      .map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { published_at: "desc" },
        include: {
          author: { select: { id: true, name: true, avatar_url: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Kategori Tidak Ditemukan" };
  }

  return {
    title: category.name,
    description:
      category.description ??
      `Baca artikel dari kategori ${category.name} di Blog Santri IMSHUS Isy Karima.`,
    openGraph: {
      title: category.name,
      description:
        category.description ??
        `Artikel dari kategori ${category.name}`,
      type: "website",
      locale: "id_ID",
    },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Semua Kategori
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">{category.name}</h1>
        </div>
        {category.description && (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        )}
      </header>

      {category.articles.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
            <h2 className="text-lg font-medium">Belum ada artikel</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Belum ada artikel dipublikasikan di kategori ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {category.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}