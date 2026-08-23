import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { htmlToPlainText, countWords } from "@/lib/utils";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
      current_revision: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  const description =
    article.excerpt ??
    (article.current_revision
      ? htmlToPlainText(article.current_revision.content).slice(0, 160)
      : "Baca artikel lengkapnya.");

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      locale: "id_ID",
      ...(article.cover_image_url ? { images: [article.cover_image_url] } : {}),
      authors: article.author?.name ? [article.author.name] : undefined,
      publishedTime: article.published_at?.toISOString(),
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const content = article.current_revision?.content ?? "";
  const wordCount = countWords(content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Artikel
      </Link>

      {/* Header */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.category && (
            <Link href={`/categories/${article.category.slug}`}>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {article.category.name}
              </Badge>
            </Link>
          )}
        </div>
        <h1 className="font-heading mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-xl leading-relaxed text-muted-foreground/80">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-l-2 border-primary/20 pl-4 py-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {article.author?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="font-medium text-foreground">
              {article.author?.name ?? "Penulis"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {article.published_at
              ? formatDate(article.published_at)
              : formatDate(article.updated_at)}
          </span>
          {wordCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {wordCount} kata
            </span>
          )}
        </div>
      </header>

      {/* Cover */}
      {article.cover_image_url && (
        <div className="mt-8 overflow-hidden rounded-xl shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url}
            alt={`Sampul artikel ${article.title}`}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="article-content mt-8"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Author box */}
      <div className="mt-10 flex items-start gap-4 rounded-xl border border-border bg-muted/50 p-5 border-l-2 border-primary/20">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {article.author?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            <User className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Penulis
          </p>
          <p className="mt-1 font-medium">{article.author?.name ?? "Penulis"}</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="outline">
          <Link href="/articles">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Artikel Lainnya
          </Link>
        </Button>
      </div>
    </article>
  );
}
