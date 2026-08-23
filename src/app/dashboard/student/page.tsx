import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
} from "@/lib/constants";
import Link from "next/link";
import {
  FileText,
  PenTool,
  Trash2,
  Clock,
  Eye,
  ArrowRight,
  Save,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { ArticleStatus } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteArticle } from "@/actions/articles";

async function deleteArticleAction(formData: FormData) {
  "use server";
  const result = await deleteArticle(formData);
  if (!result.success) {
    redirect(`/dashboard/student?error=${encodeURIComponent(result.error ?? "Gagal menghapus artikel")}`);
  }
  revalidatePath("/dashboard/student");
}

async function getDashboardStats(userId: string) {
  const articles = await prisma.article.findMany({
    where: { author_id: userId },
    select: { status: true },
  });

  const stats = {
    draft: 0,
    submitted: 0,
    revision_required: 0,
    published: 0,
  };

  for (const article of articles) {
    switch (article.status) {
      case "DRAFT":
        stats.draft++;
        break;
      case "SUBMITTED":
        stats.submitted++;
        break;
      case "REVISION_REQUIRED":
        stats.revision_required++;
        break;
      case "PUBLISHED":
      case "APPROVED":
        stats.published++;
        break;
    }
  }

  return stats;
}

async function getRecentArticles(userId: string) {
  return prisma.article.findMany({
    where: { author_id: userId },
    orderBy: { updated_at: "desc" },
    take: 10,
    include: {
      category: { select: { name: true, slug: true } },
      current_revision: { select: { content: true } },
    },
  });
}

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireStudent();
  const [{ error }, stats, articles] = await Promise.all([
    searchParams,
    getDashboardStats(user.id),
    getRecentArticles(user.id),
  ]);

  const statusCards = [
    {
      label: "Draft",
      value: stats.draft,
      icon: Save,
      iconClass: "text-gray-500",
    },
    {
      label: "Menunggu Review",
      value: stats.submitted,
      icon: Clock,
      iconClass: "text-blue-500",
    },
    {
      label: "Perlu Revisi",
      value: stats.revision_required,
      icon: ArrowRight,
      iconClass: "text-orange-500",
    },
    {
      label: "Published",
      value: stats.published,
      icon: Eye,
      iconClass: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Halo, {user.name}!</h1>
          <p className="mt-1 text-muted-foreground">
            Kelola artikel Anda dan pantau status review dari guru.
          </p>
        </div>
        <Link href="/dashboard/student/articles/new" className="sm:shrink-0">
          <Button className="w-full sm:w-auto">
            <PenTool className="h-4 w-4" aria-hidden="true" />
            Buat Artikel Baru
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statusCards.map((card) => (
          <Card key={card.label} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <card.icon className={`h-4 w-4 ${card.iconClass}`} aria-hidden="true" />
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Artikel Terbaru</CardTitle>
            <Link
              href="/dashboard/student/articles"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
              <h3 className="mb-1 text-lg font-medium">Belum ada artikel</h3>
              <p className="mb-4 text-muted-foreground">
                Mulai menulis artikel pertama Anda sekarang.
              </p>
              <Link href="/dashboard/student/articles/new">
                <Button>
                  <PenTool className="h-4 w-4" aria-hidden="true" />
                  Buat Artikel Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">Judul</TableHead>
                    <TableHead className="hidden min-w-[140px] md:table-cell">
                      Kategori
                    </TableHead>
                    <TableHead className="min-w-[140px]">Status</TableHead>
                    <TableHead className="hidden min-w-[140px] lg:table-cell">
                      Diperbarui
                    </TableHead>
                    <TableHead className="w-[110px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => {
                    const status = article.status as ArticleStatus;
                    const wordCount = article.current_revision
                      ? article.current_revision.content
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .split(" ")
                          .filter(Boolean).length
                      : 0;
                    const canDelete =
                      status === "DRAFT" || status === "REVISION_REQUIRED";

                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/dashboard/student/articles/${article.id}/edit`}
                              className="font-medium transition-colors hover:text-primary"
                            >
                              {article.title}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {wordCount} kata
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {article.category ? (
                            <span className="text-sm text-muted-foreground">
                              {article.category.name}
                            </span>
                          ) : (
                            <span className="text-sm italic text-muted-foreground">
                              Tanpa kategori
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ARTICLE_STATUS_COLORS[status]}
                          >
                            {ARTICLE_STATUS_LABELS[status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          {timeAgo(article.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              asChild
                              title="Edit"
                            >
                              <Link
                                href={`/dashboard/student/articles/${article.id}/edit`}
                              >
                                <PenTool className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            </Button>
                            {canDelete && (
                              <form action={deleteArticleAction}>
                                <input
                                  type="hidden"
                                  name="article_id"
                                  value={article.id}
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="icon-sm"
                                  title="Hapus"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </form>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}