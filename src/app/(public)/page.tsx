import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleCard } from "@/components/article/ArticleCard";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { Search, ArrowRight, BookOpen, Users, Sparkles } from "lucide-react";
import { SITE_URL, SCHOOL_NAME, SCHOOL_SHORT } from "@/lib/constants";

export const revalidate = 60;

const SITE_DESCRIPTION =
  "Platform publikasi tulisan santri IMSHUS Isy Karima dengan sistem review guru. Baca cerita, opini, dan puisi terbaik dari para santri.";

export const metadata: Metadata = {
  // title tidak di-set: root layout default sudah = SCHOOL_SHORT (tanpa suffix template)
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

async function getLatestArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { published_at: "desc" },
    take: 6,
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    getLatestArticles(),
    getCategories(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SCHOOL_SHORT,
        description: SITE_DESCRIPTION,
        inLanguage: "id-ID",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SCHOOL_NAME,
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/imshus-logo.png`,
          width: 512,
          height: 512,
        },
      },
    ],
  };

  return (
    <div>
      {/* Structured data untuk mesin pencari */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-gold/10">
        <IslamicPattern className="opacity-[0.4]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Media Literasi Santri
            </span>
            <h1 className="font-heading mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Suara Kreativitas{" "}
              <span className="text-primary">Santri IMSHUS Isy Karima</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
              Baca tulisan terbaik dari para santri: cerita, opini, puisi, dan
              pengetahuan yang telah melalui proses review guru.
            </p>

            {/* Search bar */}
            <form
              action="/articles"
              method="GET"
              className="mx-auto mt-10 flex max-w-xl gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  name="q"
                  placeholder="Cari artikel..."
                  className="h-12 rounded-full bg-card pl-10 shadow-sm ring-1 ring-primary/10 focus-visible:ring-primary/30"
                  aria-label="Cari artikel"
                />
              </div>
              <Button type="submit" className="h-12 rounded-full px-7 text-base">
                Cari
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Artikel Terbaru</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Tulisan terbaru yang telah dipublikasikan.
            </p>
          </div>
          <Link href="/articles" className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
            Lihat Semua Artikel
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {articles.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
              <h3 className="text-lg font-medium">Belum ada artikel</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Belum ada artikel yang dipublikasikan. Nantikan tulisan santri kami!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">Kategori</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Jelajahi tulisan berdasarkan kategori.
              </p>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
              Semua Kategori
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">
              Belum ada kategori.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                  <Card className="h-full transition-colors hover:border-primary/30 hover:bg-primary/5">
                    <CardContent className="py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading font-medium group-hover:text-primary">
                          {category.name}
                        </h3>
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {category._count.articles} artikel
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
