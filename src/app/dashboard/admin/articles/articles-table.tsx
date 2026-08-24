"use client";

import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { updateArticleStatus, archiveArticle, deleteArticle, updateArticleCategory } from "@/actions/admin";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  type ArticleStatus,
} from "@/lib/constants";
import { Search, Loader2, Trash2, Archive, Edit3, PenLine } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AdminArticlesTableProps {
  articles: Article[];
  categories: Category[];
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

export function AdminArticlesTable({
  articles: initialArticles,
  categories,
}: AdminArticlesTableProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<Article | null>(null);

  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialArticles, searchQuery, statusFilter]);

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("article_id", articleId);
    formData.append("status", newStatus);

    const result = await updateArticleStatus(formData);

    if (result.success) {
      toast.success("Status artikel berhasil diubah");
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, status: newStatus } : a))
      );
    } else {
      toast.error(result.error ?? "Gagal mengubah status");
    }
    setIsSubmitting(false);
  };

  const handleCategoryChange = async (articleId: string, newCategoryId: string | null) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("article_id", articleId);
    formData.append("category_id", newCategoryId ?? "");

    const result = await updateArticleCategory(formData);

    if (result.success) {
      toast.success("Kategori artikel berhasil diubah");
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, category: newCategoryId ? categories.find(c => c.id === newCategoryId) ?? null : null } : a
        )
      );
    } else {
      toast.error(result.error ?? "Gagal mengubah kategori");
    }
    setIsSubmitting(false);
  };

  const handleArchive = async (articleId: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("article_id", articleId);

    const result = await archiveArticle(formData);

    if (result.success) {
      toast.success("Artikel berhasil diarsipkan");
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, status: "ARCHIVED" as ArticleStatus } : a))
      );
    } else {
      toast.error(result.error ?? "Gagal mengarsipkan artikel");
    }
    setIsSubmitting(false);
  };

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
    setDeleteDialogOpen(null);
    setIsSubmitting(false);
  };

  const openEditDialog = (article: Article) => {
    setEditDialogOpen(article);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialogOpen) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const newStatus = String(formData.get("status")) as ArticleStatus;
    const newCategoryId = String(formData.get("category_id")) || null;

    const noop = { success: true as const };
    const [statusResult, categoryResult] = await Promise.all([
      newStatus !== editDialogOpen.status
        ? updateArticleStatus(
            (() => {
              const fd = new FormData();
              fd.append("article_id", editDialogOpen.id);
              fd.append("status", newStatus);
              return fd;
            })()
          )
        : noop,
      newCategoryId !== editDialogOpen.category?.id
        ? updateArticleCategory(
            (() => {
              const fd = new FormData();
              fd.append("article_id", editDialogOpen.id);
              fd.append("category_id", newCategoryId ?? "");
              return fd;
            })()
          )
        : noop,
    ]);

    if (statusResult.success && categoryResult.success) {
      toast.success("Artikel berhasil diupdate");
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editDialogOpen.id
            ? { ...a, status: newStatus, category: newCategoryId ? categories.find(c => c.id === newCategoryId) ?? null : null }
            : a
        )
      );
      setEditDialogOpen(null);
    } else {
      toast.error(
        "error" in statusResult && statusResult.error
          ? statusResult.error
          : "error" in categoryResult && categoryResult.error
            ? categoryResult.error
            : "Gagal mengupdate artikel"
      );
    }
    setIsSubmitting(false);
  };

  const getStatusBadgeVariant = (): "outline" => {
    // Using outline variant with custom colors from constants
    return "outline";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul, penulis, excerpt..."
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
                    className={cn("font-normal border-transparent", ARTICLE_STATUS_COLORS[s])}
                  >
                    {ARTICLE_STATUS_LABELS[s]}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredArticles.length} dari {articles.length} artikel
          </span>
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead className="hidden lg:table-cell">Penulis</TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Dibuat</TableHead>
              <TableHead className="w-[180px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Tidak ada artikel yang cocok
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article, index) => (
                <TableRow key={article.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div>
                      <p className="font-medium truncate">{article.title}</p>
                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground truncate">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {article.author.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={article.author.avatar_url}
                            alt={article.author.name}
                            className="size-full rounded-full object-cover"
                          />
                        ) : (
                          article.author.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm">{article.author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {article.category ? (
                      <Badge variant="secondary">{article.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant()}
                      className={cn(
                        "font-normal border-transparent",
                        ARTICLE_STATUS_COLORS[article.status]
                      )}
                    >
                      {ARTICLE_STATUS_LABELS[article.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {timeAgo(article.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Status dropdown */}
                      <Select
                        value={article.status}
                        onValueChange={(value) =>
                          handleStatusChange(article.id, value as ArticleStatus)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-normal border-transparent w-full justify-start",
                                  ARTICLE_STATUS_COLORS[s]
                                )}
                              >
                                {ARTICLE_STATUS_LABELS[s]}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Category dropdown */}
                      <Select
                        value={article.category?.id ?? "none"}
                        onValueChange={(value) =>
                          handleCategoryChange(
                            article.id,
                            value === "none" ? null : value
                          )
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-[130px] hidden md:flex">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Tanpa Kategori —</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Edit button (status & kategori) */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(article)}
                        disabled={isSubmitting}
                      >
                        <Edit3 className="size-4" />
                        <span className="sr-only">Edit Status</span>
                      </Button>

                      {/* Edit Konten button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/articles/${article.id}/edit`
                          )
                        }
                        disabled={isSubmitting}
                        title="Edit konten artikel"
                      >
                        <PenLine className="size-4" />
                        <span className="sr-only">Edit Konten</span>
                      </Button>

                      {/* Archive button */}
                      {article.status !== "ARCHIVED" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleArchive(article.id)}
                          disabled={isSubmitting}
                        >
                          <Archive className="size-4" />
                          <span className="sr-only">Arsipkan</span>
                        </Button>
                      )}

                      {/* Delete button */}
                      <AlertDialog
                        open={deleteDialogOpen === article.id}
                        onOpenChange={(open) => {
                          if (!open) setDeleteDialogOpen(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={isSubmitting}
                            onClick={() => setDeleteDialogOpen(article.id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Artikel{" "}
                              <strong>{article.title}</strong> akan dihapus permanen
                              beserta seluruh revisi dan komentar review.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialogOpen} onOpenChange={(open) => !open && setEditDialogOpen(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Artikel</DialogTitle>
          </DialogHeader>
          {editDialogOpen && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <p className="text-sm text-muted-foreground">{editDialogOpen.title}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  name="status"
                  defaultValue={editDialogOpen.status}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-normal border-transparent w-full justify-start",
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
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategori</Label>
                <Select
                  name="category_id"
                  defaultValue={editDialogOpen.category?.id ?? "none"}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tanpa Kategori —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(null)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}