import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth/session";
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
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
} from "@/lib/constants";
import Link from "next/link";
import { redirect } from "next/navigation";
import { startReview } from "@/actions/reviews";
import {
  FileText,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  User,
  BookOpen,
} from "lucide-react";
import { formatDate, timeAgo, cn } from "@/lib/utils";
import type { ArticleStatus } from "@/types";

// ============================================================
// Dashboard Guru — halaman utama
// ============================================================

async function getDashboardStats() {
  const [
    pendingReview,
    inReview,
    revisionRequired,
    approvedToday,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "SUBMITTED" } }),
    prisma.article.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.article.count({ where: { status: "REVISION_REQUIRED" } }),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        published_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return { pendingReview, inReview, revisionRequired, approvedToday };
}

async function getPendingArticles() {
  return prisma.article.findMany({
    where: { status: "SUBMITTED" },
    orderBy: { updated_at: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
      current_revision: { select: { id: true, content: true } },
    },
  });
}

async function getInReviewArticles() {
  return prisma.article.findMany({
    where: { status: "UNDER_REVIEW" },
    orderBy: { updated_at: "desc" },
    take: 20,
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        where: { decision: "IN_REVIEW" },
        select: { id: true, reviewer: { select: { name: true } } },
      },
    },
  });
}

async function getRecentHistory() {
  return prisma.article.findMany({
    where: {
      status: { in: ["PUBLISHED", "REVISION_REQUIRED"] },
    },
    orderBy: { updated_at: "desc" },
    take: 10,
    include: {
      author: { select: { id: true, name: true, avatar_url: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireTeacher();
  const { tab } = await searchParams;

  const [stats, pendingArticles, inReviewArticles, historyArticles] =
    await Promise.all([
      getDashboardStats(),
      getPendingArticles(),
      getInReviewArticles(),
      getRecentHistory(),
    ]);

  // Jika tab dipilih, hanya render bagian yang relevan
  const showDashboard = tab === undefined || tab === "";
  const showSubmitted = tab === "submitted";
  const showReviewing = tab === "reviewing";
  const showHistory = tab === "history";

  const statCards = [
    {
      label: "Menunggu Review",
      value: stats.pendingReview,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Sedang Direview",
      value: stats.inReview,
      icon: Eye,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Perlu Revisi",
      value: stats.revisionRequired,
      icon: AlertTriangle,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      label: "Approved Hari Ini",
      value: stats.approvedToday,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold">Selamat Datang, Guru!</h1>
        <p className="text-muted-foreground mt-1">
          Kelola review artikel santri dan pantau perkembangan mereka.
        </p>
      </div>

      {/* Statistik (hanya di dashboard utama) */}
      {showDashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card
              key={card.label}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl",
                      card.bg
                    )}
                  >
                    <card.icon className={cn("size-6", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Artikel menunggu review */}
      {(showDashboard || showSubmitted) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <InboxIcon className="h-5 w-5 text-blue-500" />
                Menunggu Review
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {stats.pendingReview} artikel
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {pendingArticles.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg mb-1">Tidak ada artikel</h3>
                <p className="text-muted-foreground">
                  Semua artikel sudah direview.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Penulis</TableHead>
                    <TableHead className="hidden lg:table-cell">Kategori</TableHead>
                    <TableHead>Dikirim</TableHead>
                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingArticles.map((article) => {
                    const wordCount = article.current_revision
                      ? article.current_revision.content
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .split(" ")
                          .filter(Boolean).length
                      : 0;

                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/dashboard/teacher/reviews/${article.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {article.title}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {wordCount} kata
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{article.author?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
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
                        <TableCell className="text-sm text-muted-foreground">
                          {timeAgo(article.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <form
                            action={async (formData) => {
                              "use server";
                              const result = await startReview(formData);
                              const data = result.data as { review_id?: string } | undefined;
                              if (result.success && data?.review_id) {
                                redirect(
                                  `/dashboard/teacher/reviews/${formData.get("article_id")}`
                                );
                              }
                            }}
                          >
                            <input type="hidden" name="article_id" value={article.id} />
                            <Button type="submit" size="sm">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Review
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sedang Direview */}
      {(showDashboard || showReviewing) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-yellow-500" />
                Sedang Direview
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {stats.inReview} artikel
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {inReviewArticles.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg mb-1">Belum ada artikel direview</h3>
                <p className="text-muted-foreground">
                  Mulai review dari artikel yang menunggu.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Penulis</TableHead>
                    <TableHead className="hidden lg:table-cell">Direview Oleh</TableHead>
                    <TableHead>Diperbarui</TableHead>
                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inReviewArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/teacher/reviews/${article.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {article.author?.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {article.reviews?.[0]?.reviewer?.name ?? "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {timeAgo(article.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/teacher/reviews/${article.id}`}>
                          <Button variant="outline" size="sm">
                            <ArrowRight className="h-3.5 w-3.5 mr-1" />
                            Lanjutkan
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riwayat */}
      {(showDashboard || showHistory) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Riwayat Terbaru
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {historyArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada riwayat review.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Judul</TableHead>
                    <TableHead className="hidden md:table-cell">Penulis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Diperbarui</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyArticles.map((article) => {
                    const status = article.status as ArticleStatus;
                    return (
                      <TableRow key={article.id}>
                        <TableCell>
                          <span className="font-medium">{article.title}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {article.author?.name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={ARTICLE_STATUS_COLORS[status]}
                          >
                            {ARTICLE_STATUS_LABELS[status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {timeAgo(article.updated_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Ikon Inbox (lucide-react tidak punya InboxIcon, pakai versi inline)
function InboxIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}