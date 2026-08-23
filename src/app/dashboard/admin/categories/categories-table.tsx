"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createCategory, deleteCategory } from "@/actions/users";
import { updateCategory } from "@/actions/admin";
import { PlusIcon, Loader2, Trash2, Edit3, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  _count: {
    articles: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({
  categories: initialCategories,
}: CategoriesTableProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);

    if (result.success) {
      toast.success("Kategori berhasil dibuat");
      setIsCreateOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error ?? "Gagal membuat kategori");
    }
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("category_id", editDialog.id);

    const result = await updateCategory(formData);

    if (result.success) {
      toast.success("Kategori berhasil diupdate");
      const name = String(formData.get("name") || "").trim();
      const description = (formData.get("description") as string)?.trim() || null;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editDialog.id
            ? {
                ...c,
                name,
                description,
                slug: name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              }
            : c
        )
      );
      setEditDialog(null);
    } else {
      toast.error(result.error ?? "Gagal mengupdate kategori");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (categoryId: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("category_id", categoryId);

    const result = await deleteCategory(formData);

    if (result.success) {
      toast.success("Kategori berhasil dihapus");
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } else {
      toast.error(result.error ?? "Gagal menghapus kategori");
    }
    setDeleteDialogOpen(null);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Kategori</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Contoh: Ilmu Pengetahuan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi singkat kategori..."
                  rows={3}
                />
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
                    "Simpan"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden lg:table-cell">Deskripsi</TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead className="hidden lg:table-cell">Dibuat</TableHead>
              <TableHead className="w-[120px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Belum ada kategori
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(category.created_at)}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      /kategori/{category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px]">
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <FileText className="mr-1 size-3" />
                      {category._count.articles}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(category.created_at)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditDialog(category)}
                        disabled={isSubmitting}
                      >
                        <Edit3 className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <AlertDialog
                        open={deleteDialogOpen === category.id}
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
                            onClick={() => setDeleteDialogOpen(category.id)}
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Kategori <strong>{category.name}</strong> akan dihapus.
                              Artikel yang menggunakan kategori ini akan menjadi
                              &ldquo;tanpa kategori&rdquo;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
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
      <Dialog
        open={!!editDialog}
        onOpenChange={(open) => !open && setEditDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          {editDialog && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Kategori</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editDialog.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Deskripsi (opsional)</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editDialog.description ?? ""}
                  placeholder="Deskripsi singkat kategori..."
                  rows={3}
                />
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
                  onClick={() => setEditDialog(null)}
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