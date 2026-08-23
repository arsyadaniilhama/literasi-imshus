import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/session";
import { ArticleEditClient } from "../[id]/edit/ArticleEditClient";

export default async function NewArticlePage() {
  const user = await requireStudent();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <ArticleEditClient
      articleId={null}
      title=""
      excerpt=""
      coverImageUrl=""
      categoryId=""
      content=""
      contentJson={{}}
      status="DRAFT"
      createdAt={new Date().toISOString()}
      updatedAt={new Date().toISOString()}
      slug={null}
      authorName={user.name}
      categories={categories}
      isEditable={true}
      reviews={[]}
    />
  );
}