"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteArticle } from "@/actions/articles";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  type ArticleStatus,
} from "@/lib/constants";
import { Search, Loader2, Trash2, PenTool, FileText } from "lucide-react";
import { toast } from "sonner";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StudentArticle {
  id: string;
  title: string;
  status: ArticleStatus;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

interface StudentArticlesTableProps {
  articles: StudentArticle[];
}

const ALL_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
];

export function StudentArticlesTable({
  articles: initialArticles,
}: StudentArticlesTableProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = article.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, searchQuery, statusFilter]);

  const canDelete = (status: ArticleStatus) =>
    status === "DRAFT" || status === "REVISION_REQUIRED";

  const handleDelete = async (articleId: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("article_id", articleId);

    const result = await deleteArticle(formData);

    if (result.success) {
      toast.success("Artikel berhasil dihapus");
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } else {
      toast.error(result.error ?? "Gagal menghapus artikel");
    }
    setDeleteId(null);
    setIsSubmitting(false);
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card py-16 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
        <h3 className="font-heading mb-1 text-lg font-semibold">Belum ada artikel</h3>
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari judul artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal border-transparent",
                      ARTICLE_STATUS_COLORS[s]
                    )}
                  >
                    {ARTICLE_STATUS_LABELS[s]}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground">
          {filteredArticles.length} dari {articles.length} artikel
        </span>
      </div>

      {/* Articles table */}
      <div className="rounded-xl border">
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
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Tidak ada artikel yang cocok
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
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
                        {article.word_count} kata
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
                      className={ARTICLE_STATUS_COLORS[article.status]}
                    >
                      {ARTICLE_STATUS_LABELS[article.status]}
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
                      {canDelete(article.status) && (
                        <AlertDialog
                          open={deleteId === article.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteId(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Hapus"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(article.id)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Artikel{" "}
                                <strong>{article.title}</strong> akan dihapus
                                permanen beserta seluruh revisi dan komentar
                                review.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(article.id)}
                                disabled={isSubmitting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                              >
                                {isSubmitting && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
