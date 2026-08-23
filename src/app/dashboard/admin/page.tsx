import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  FolderTree,
  Clock,
  ArrowRightIcon,
  MessageSquareText,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  type ArticleStatus,
} from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  // Fetch statistics
  const [totalUsers, totalArticles, totalCategories, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.category.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  // Article status breakdown
  const articleStatuses = await prisma.article.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/dashboard/admin/users",
    },
    {
      title: "Total Articles",
      value: totalArticles,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/dashboard/admin/articles",
    },
    {
      title: "Total Categories",
      value: totalCategories,
      icon: FolderTree,
      color: "text-gold",
      bgColor: "bg-gold/10",
      href: "/dashboard/admin/categories",
    },
    {
      title: "Recent Activity",
      value: recentActivity.length,
      icon: Clock,
      color: "text-gold",
      bgColor: "bg-gold/10",
      href: "/dashboard/admin/activity",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dasbor Admin</h1>
          <p className="text-muted-foreground">
            Kelola platform Blog Santri IMSHUS Isy Karima
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <Link href={stat.href} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl",
                      stat.bgColor
                    )}
                  >
                    <stat.icon className={cn("size-6", stat.color)} />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Article status breakdown + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Article Status Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Artikel per Status</CardTitle>
            <Link href="/dashboard/admin/articles" className="text-sm text-primary hover:underline">
              Lihat semua
              <ArrowRightIcon className="inline size-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {articleStatuses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Belum ada artikel
              </p>
            ) : (
              <div className="space-y-3">
                {articleStatuses.map((item) => {
                  const status = item.status as ArticleStatus;
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal border-transparent w-40 text-left",
                          ARTICLE_STATUS_COLORS[status]
                        )}
                      >
                        {ARTICLE_STATUS_LABELS[status]}
                      </Badge>
                      <span className="text-2xl font-bold text-right min-w-[60px]">
                        {item._count.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <Link
              href="/dashboard/admin/activity"
              className="text-sm text-primary hover:underline"
            >
              Lihat semua
              <ArrowRightIcon className="inline size-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Belum ada aktivitas
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Clock className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {log.user?.name ?? "System"}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {log.action.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(log.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/admin/users?create=true">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="size-6" />
                <span>Tambah User</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/articles?create=true">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FileText className="size-6" />
                <span>Tambah Artikel</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/categories?create=true">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FolderTree className="size-6" />
                <span>Tambah Kategori</span>
              </Button>
            </Link>
            <Link href="/dashboard/admin/reviews">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <MessageSquareText className="size-6" />
                <span>Kelola Review</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}