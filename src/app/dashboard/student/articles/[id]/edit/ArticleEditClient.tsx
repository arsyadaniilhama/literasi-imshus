"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { saveDraft, submitArticle } from "@/actions/articles";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Save,
  Send,
  AlertCircle,
  FileText,
  Tag,
  PenTool,
  Eye,
} from "lucide-react";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  REVIEW_COMMENT_TYPE_LABELS,
  REVIEW_COMMENT_TYPE_DOT,
} from "@/lib/constants";
import type { ActionResult, ArticleStatus, ReviewCommentType } from "@/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface ReviewCommentData {
  id: string;
  type: ReviewCommentType;
  selectedText: string;
  comment: string;
  status: "OPEN" | "RESOLVED";
}

interface ReviewData {
  id: string;
  generalComment: string | null;
  reviewerName: string;
  comments: ReviewCommentData[];
}

interface ArticleEditClientProps {
  articleId: string | null;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  categoryId: string;
  content: string;
  contentJson: Record<string, unknown>;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  slug: string | null;
  authorName: string;
  categories: CategoryOption[];
  isEditable: boolean;
  reviews: ReviewData[];
}

export function ArticleEditClient({
  articleId,
  title: initialTitle,
  excerpt: initialExcerpt,
  coverImageUrl: initialCoverImageUrl,
  categoryId: initialCategoryId,
  content: initialContent,
  contentJson: initialContentJson,
  status,
  createdAt,
  updatedAt,
  slug,
  authorName,
  categories,
  isEditable,
  reviews,
}: ArticleEditClientProps) {
  const router = useRouter();
  const isNew = articleId === null;

  const [title, setTitle] = React.useState(initialTitle);
  const [excerpt, setExcerpt] = React.useState(initialExcerpt);
  const [coverImageUrl, setCoverImageUrl] = React.useState(initialCoverImageUrl);
  const [categoryId, setCategoryId] = React.useState(initialCategoryId);
  const [content, setContent] = React.useState(initialContent);
  const [contentJson, setContentJson] = React.useState(initialContentJson);
  const [activeTab, setActiveTab] = React.useState<"editor" | "preview">("editor");

  const latestReview = reviews[0];
  const hasRevisionRequired =
    status === "REVISION_REQUIRED" && latestReview != null;

  const [saveState, saveAction, savePending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => saveDraft(formData),
    null
  );
  const [submitState, submitAction, submitPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => submitArticle(formData),
    null
  );

  const isPending = savePending || submitPending;

  // Toast when save draft finishes
  React.useEffect(() => {
    if (!saveState) return;
    if (saveState.success) {
      toast.success("Draft berhasil disimpan");
      router.refresh();
    } else if (saveState.error) {
      toast.error(saveState.error);
    } else if (saveState.errors) {
      const firstError = Object.values(saveState.errors)[0]?.[0];
      toast.error(firstError ?? "Terjadi kesalahan saat menyimpan draft");
    }
  }, [saveState, router]);

  // Toast + navigate when submit finishes
  React.useEffect(() => {
    if (!submitState) return;
    if (submitState.success) {
      toast.success("Artikel berhasil dikirim untuk review");
      const submittedId =
        submitState.data &&
        typeof submitState.data === "object" &&
        "id" in submitState.data
          ? (submitState.data as { id: string }).id
          : null;
      router.push(
        submittedId
          ? `/dashboard/student/articles/${submittedId}/edit`
          : "/dashboard/student"
      );
    } else if (submitState.error) {
      toast.error(submitState.error);
    } else if (submitState.errors) {
      const firstError = Object.values(submitState.errors)[0]?.[0];
      toast.error(firstError ?? "Terjadi kesalahan saat mengirim artikel");
    }
  }, [submitState, router]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {isNew ? "Buat Artikel Baru" : "Edit Artikel"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {hasRevisionRequired
              ? "Perbaiki artikel berdasarkan catatan guru, lalu kirim ulang."
              : isNew
                ? "Tulis artikel Anda dan simpan sebagai draft atau kirim untuk review."
                : "Tulis dan kelola artikel Anda di sini."}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`w-fit ${ARTICLE_STATUS_COLORS[status]}`}
        >
          {ARTICLE_STATUS_LABELS[status]}
        </Badge>
      </div>

      {/* Revision Required Alert */}
      {hasRevisionRequired && latestReview && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div className="font-medium">
              Artikel perlu direvisi berdasarkan review dari{" "}
              {latestReview.reviewerName}
            </div>
            {latestReview.generalComment && (
              <div className="text-sm">
                <strong>Catatan umum:</strong> {latestReview.generalComment}
              </div>
            )}
            {latestReview.comments.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-sm font-medium">
                  Komentar detail ({latestReview.comments.length}):
                </div>
                <ul className="space-y-2">
                  {latestReview.comments.map((comment) => (
                    <li
                      key={comment.id}
                      className="flex items-start gap-2 rounded-lg border border-orange-200 bg-white/60 p-2.5 text-sm dark:border-orange-800 dark:bg-orange-950/30"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${REVIEW_COMMENT_TYPE_DOT[comment.type]}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {REVIEW_COMMENT_TYPE_LABELS[comment.type]}
                        </span>
                        {comment.selectedText && (
                          <div className="mt-0.5 rounded bg-orange-100/80 px-1.5 py-0.5 italic text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                            &ldquo;{comment.selectedText}&rdquo;
                          </div>
                        )}
                        <div className="mt-0.5 text-orange-900/90 dark:text-orange-100/90">
                          {comment.comment}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <form action={saveAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <input type="hidden" name="article_id" value={articleId ?? ""} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="content_json" value={JSON.stringify(contentJson)} />

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
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul artikel..."
              required
              minLength={3}
              maxLength={200}
              disabled={!isEditable}
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
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat artikel (opsional, maksimal 300 karakter)..."
              rows={3}
              maxLength={300}
              disabled={!isEditable}
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
              name="cover_image_url"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://contoh.com/gambar-cover.jpg"
              disabled={!isEditable}
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
              disabled={!isEditable}
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
            <input type="hidden" name="category_id" value={categoryId} />
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
                disabled={!isEditable}
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
                Status & Aksi
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

              <Separator />

              {isEditable ? (
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                    size="lg"
                  >
                    {savePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    Simpan Draft
                  </Button>
                  {!isNew && (
                    <Button
                      type="submit"
                      formAction={submitAction}
                      variant="secondary"
                      className="w-full"
                      disabled={isPending}
                      size="lg"
                    >
                      {submitPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                      Kirim untuk Review
                    </Button>
                  )}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Artikel tidak dapat diedit karena status{" "}
                  <strong>{ARTICLE_STATUS_LABELS[status]}</strong>.
                </p>
              )}
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
              {reviews.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Riwayat review</span>
                  <span className="font-medium">{reviews.length} kali</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          {!isNew && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" aria-hidden="true" />
                  Informasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Penulis</span>
                  <span className="truncate font-medium">{authorName}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span className="text-right">
                    {new Date(createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Diperbarui</span>
                  <span className="text-right">
                    {new Date(updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {slug && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="truncate font-mono text-xs">{slug}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}