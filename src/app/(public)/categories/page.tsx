import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori",
  description: "Jelajahi artikel santri berdasarkan kategori.",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        select: { id: true },
        take: 1,
      },
      _count: {
        select: {
          articles: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
          Kategori
        </span>
        <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight">Jelajahi Kategori</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Temukan tulisan santri berdasarkan topik yang Anda minati.
        </p>
      </div>

      {categories.length === 0 ? (
        <Card className="mt-10">
          <CardContent className="py-16 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Belum ada kategori.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group">
              <Card className="h-full transition-colors hover:border-primary/30 hover:bg-primary/5">
                <CardContent className="flex items-start justify-between gap-3 py-6">
                  <div>
                    <h2 className="font-heading text-lg font-medium group-hover:text-primary">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 bg-primary/10 text-primary">
                    {category._count.articles}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
