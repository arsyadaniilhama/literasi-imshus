"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminUpdateArticle } from "@/actions/admin";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Save,
  FileText,
  Tag,
  PenTool,
  Eye,
} from "lucide-react";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
} from "@/lib/constants";
import type { ArticleStatus } from "@/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface AdminArticleEditClientProps {
  articleId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  categoryId: string;
  content: string;
  contentJson: Record<string, unknown>;
  status: ArticleStatus;
  slug: string | null;
  categories: CategoryOption[];
}

export function AdminArticleEditClient({
  articleId,
  title: initialTitle,
  excerpt: initialExcerpt,
  coverImageUrl: initialCoverImageUrl,
  categoryId: initialCategoryId,
  content: initialContent,
  status,
  slug,
  categories,
}: AdminArticleEditClientProps) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initialTitle);
  const [excerpt, setExcerpt] = React.useState(initialExcerpt);
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialCoverImageUrl);
  const [categoryId, setCategoryId] = React.useState(initialCategoryId);
  const [content, setContent] = React.useState(initialContent);
  const [contentJson, setContentJson] = React.useState<Record<string, unknown>>(
    {}
  );
  const [activeTab, setActiveTab] = React.useState<"editor" | "preview">(
    "editor"
  );
  const [saving, setSaving] = React.useState(false);

  const handleContentChange = (html: string, json: unknown) => {
    setContent(html);
    setContentJson(json as Record<string, unknown>);
  };

  const wordCount = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
  const charCount = content.replace(/<[^>]*>/g, "").length;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("article_id", articleId);
      fd.append("title", title);
      fd.append("excerpt", excerpt);
      fd.append("cover_image_url", coverImageUrl);
      fd.append("category_id", categoryId);
      fd.append("content", content);
      fd.append("content_json", JSON.stringify(contentJson));

      const result = await adminUpdateArticle(fd);
      if (!result.success) {
        if (result.errors) {
          const firstFieldError = Object.values(result.errors).flat()[0];
          toast.error(firstFieldError ?? "Gagal menyimpan perubahan.");
        } else {
          toast.error(result.error || "Gagal menyimpan perubahan.");
        }
        return;
      }

      toast.success("Artikel berhasil diperbarui.");
      router.push("/dashboard/admin/articles");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/admin/articles")}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">Edit Artikel</h1>
            <p className="mt-1 text-muted-foreground">
              Perbaiki konten artikel — perubahan langsung berlaku di publikasi.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`w-fit ${ARTICLE_STATUS_COLORS[status]}`}
        >
          {ARTICLE_STATUS_LABELS[status]}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Editor column */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "editor"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <PenTool className="h-4 w-4" aria-hidden="true" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Pratinjau
            </button>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-1.5 block">
              Judul Artikel <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul artikel..."
              required
              minLength={3}
              maxLength={200}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Minimal 3 karakter, maksimal 200 karakter
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt" className="mb-1.5 block">
              Ringkasan (Excerpt)
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel (opsional, maksimal 300 karakter)..."
              rows={3}
              maxLength={300}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {excerpt.length}/300 karakter
            </p>
          </div>

          {/* Cover image */}
          <div>
            <Label htmlFor="cover_image_url" className="mb-1.5 block">
              URL Gambar Cover
            </Label>
            <Input
              id="cover_image_url"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://contoh.com/gambar-cover.jpg"
            />
            {coverImageUrl && (
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Pratinjau cover"
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category_id" className="mb-1.5 block">
              Kategori
            </Label>
            <Select
              value={categoryId || "none"}
              onValueChange={(value) =>
                setCategoryId(value === "none" ? "" : value)
              }
            >
              <SelectTrigger id="category_id" className="w-full">
                <SelectValue placeholder="Pilih kategori (opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div>
            <Label className="mb-1.5 block">
              Konten Artikel <span className="text-destructive">*</span>
            </Label>
            {activeTab === "editor" ? (
              <TiptapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Mulai menulis..."
              />
            ) : (
              <div
                className="min-h-[320px] rounded-lg border border-border bg-background p-3"
                dangerouslySetInnerHTML={{
                  __html: content || "<p>Konten masih kosong.</p>",
                }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Save className="h-4 w-4" aria-hidden="true" />
                Aksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="text-sm font-medium">Status Saat Ini</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${ARTICLE_STATUS_COLORS[status]}`}
                  >
                    {ARTICLE_STATUS_LABELS[status]}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Status artikel tidak akan berubah. Setiap simpan membuat revisi
                baru (riwayat tetap terjaga).
              </p>

              <Button
                type="submit"
                className="w-full"
                disabled={saving}
                size="lg"
              >
                {saving ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="h-4 w-4" aria-hidden="true" />
                )}
                Simpan Perubahan
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/admin/articles")}
              >
                Batal
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jumlah kata</span>
                <span className="font-medium">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Karakter</span>
                <span className="font-medium">{charCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Informasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {slug && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Slug</span>
                  <span className="truncate font-mono text-xs">{slug}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
