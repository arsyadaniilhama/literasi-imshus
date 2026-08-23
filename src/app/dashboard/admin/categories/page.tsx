import { prisma } from "@/lib/prisma";
import { CategoriesTable } from "./categories-table";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    created_at: c.created_at.toISOString(),
    updated_at: c.updated_at.toISOString(),
    _count: {
      articles: c._count.articles,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori artikel untuk platform
          </p>
        </div>
      </div>

      <CategoriesTable categories={serializedCategories} />
    </div>
  );
}