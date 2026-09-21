"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminUpdateArticle } from "@/actions/admin";
import { uploadCoverImage } from "@/actions/articles";
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
  Upload,
  X,
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
  const [isUploadingCover, setIsUploadingCover] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = React.useState(initialCategoryId);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }

    setIsUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadCoverImage(fd);
      if (!res.success || !res.data?.url) {
        toast.error(res.error || "Gagal mengunggah foto sampul.");
      } else {
        setCoverImageUrl(res.data.url);
        toast.success("Foto sampul berhasil diunggah!");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCoverUrlChange = (val: string) => {
    let cleanVal = val.trim();
    if (cleanVal.includes("google.com/imgres")) {
      try {
        const parsed = new URL(cleanVal);
        const realUrl = parsed.searchParams.get("imgurl");
        if (realUrl) {
          cleanVal = realUrl;
          toast.info("URL gambar asli dari Google berhasil diekstrak.");
        }
      } catch {
        // Abaikan jika URL tidak valid
      }
    }
    setCoverImageUrl(cleanVal);
  };
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
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="cover_image_url" className="block">
                Foto Sampul (Cover)
              </Label>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="text-xs text-destructive hover:underline inline-flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Hapus Cover
                </button>
              )}
            </div>

            {/* Input file upload tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverFileUpload}
              disabled={isUploadingCover}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="shrink-0 h-10 gap-1.5"
              >
                {isUploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{isUploadingCover ? "Mengunggah..." : "Upload Foto"}</span>
              </Button>

              <Input
                id="cover_image_url"
                type="url"
                value={coverImageUrl}
                onChange={(e) => handleCoverUrlChange(e.target.value)}
                placeholder="Atau tempel URL gambar (https://...)"
                disabled={isUploadingCover}
                className="h-10 text-sm"
              />
            </div>

            {coverImageUrl && (
              <div className="mt-3 relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Pratinjau cover"
                  className="h-full w-full object-cover"
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
                className="article-content min-h-[320px] rounded-lg border border-border bg-background p-4 sm:p-6 break-words overflow-hidden"
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
