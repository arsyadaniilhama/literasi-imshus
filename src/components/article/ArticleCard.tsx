import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenLine } from "lucide-react";
import { timeAgo, formatDate } from "@/lib/utils";

export interface ArticleCardProps {
  article: {
    id: string;
    slug: string | null;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | Date | null;
    updated_at: string | Date;
    author?: { name: string | null; avatar_url: string | null } | null;
    category?: { name: string; slug: string } | null;
  };
}

/**
 * Kartu artikel yang dipakai bersama di beranda, daftar artikel,
 * dan halaman kategori — menghilangkan duplikasi JSX.
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const coverUrl = article.cover_image_url?.trim();
  const hasCover = Boolean(
    coverUrl &&
      (coverUrl.startsWith("http://") ||
        coverUrl.startsWith("https://") ||
        coverUrl.startsWith("/"))
  );

  return (
    <Card
      size="sm"
      className="group flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg [font-family:var(--font-geist-sans),sans-serif]"
    >
      {hasCover && coverUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={coverUrl}
            alt={`Sampul artikel ${article.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/10 to-gold/10">
          <PenLine className="h-10 w-10 text-primary/40" aria-hidden="true" />
        </div>
      )}
      <CardHeader className="border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {article.category && (
            <Link href={`/categories/${article.category.slug}`}>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {article.category.name}
              </Badge>
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            {article.published_at
              ? formatDate(article.published_at)
              : timeAgo(article.updated_at)}
          </span>
        </div>
        <CardTitle className="font-heading mt-1 line-clamp-2 text-base font-semibold">
          {article.slug ? (
            <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-primary">
              {article.title}
            </Link>
          ) : (
            article.title
          )}
        </CardTitle>
        {article.excerpt && (
          <CardDescription className="mt-1 line-clamp-2">
            {article.excerpt}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto pt-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {article.author?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm text-muted-foreground">
            {article.author?.name ?? "Penulis"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
