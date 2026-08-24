"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextSelection } from "@tiptap/pm/state";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REVIEW_COMMENT_TYPES,
  REVIEW_COMMENT_TYPE_COLORS,
  REVIEW_COMMENT_TYPE_LABELS,
} from "@/lib/constants";
import { HighlightMark } from "@/components/review/HighlightMark";
import { ReviewCommentPanel } from "@/components/review/ReviewCommentPanel";
import {
  createReviewComment,
  requestRevision,
  approveArticle,
} from "@/actions/reviews";
import {
  Loader2,
  PenLine,
  MessageSquarePlus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ScrollText,
} from "lucide-react";
import type {
  ReviewComment,
  ReviewCommentType,
} from "@/types";

interface ReviewWorkspaceProps {
  articleId: string;
  articleTitle: string;
  authorName: string;
  categoryName: string | null;
  revisionContent: string;
  reviewId: string;
  generalComment: string | null;
  initialComments: ReviewComment[];
}

interface CommentDraft {
  selectedText: string;
  from: number;
  to: number;
  comment: string;
  type: ReviewCommentType;
}

// ============================================================
// Workspace Review — dua kolom (artikel + panel komentar)
// ============================================================

export function ReviewWorkspace({
  articleId,
  articleTitle,
  authorName,
  categoryName,
  revisionContent,
  reviewId,
  generalComment,
  initialComments,
}: ReviewWorkspaceProps) {
  const router = useRouter();

  // ---- State ----
  const [comments, setComments] = React.useState<ReviewComment[]>(initialComments);
  const [draft, setDraft] = React.useState<CommentDraft | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [toolbarPos, setToolbarPos] = React.useState<{ top: number; left: number } | null>(null);
  const [commentText, setCommentText] = React.useState("");
  const [commentType, setCommentType] = React.useState<ReviewCommentType>("LANGUAGE");
  const [saving, setSaving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [activeCommentId, setActiveCommentId] = React.useState<string | null>(null);
  const [showGeneralComment, setShowGeneralComment] = React.useState(false);
  const [generalText, setGeneralText] = React.useState(generalComment ?? "");

  // ---- Editor Tiptap (read-only) ----
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Underline,
      HighlightMark,
    ],
    content: revisionContent,
    editable: false,
    editorProps: {
      attributes: {
        class: "review-editor-content",
      },
      handleDOMEvents: {
        mouseup: (view, event) => {
          handleMouseUp(event);
          return false;
        },
      },
    },
  }) as Editor | null;

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Tutup toolbar saat scroll artikel
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!isPopoverOpen) {
        setDraft(null);
        setToolbarPos(null);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isPopoverOpen]);

  // ---- Handler: blok teks di artikel ----
  const handleMouseUp = (event: MouseEvent) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      // Sembunyikan toolbar jika tidak ada selection
      if (toolbarPos) {
        setDraft(null);
        setToolbarPos(null);
      }
      return;
    }

    if (!editor) return;

    // Pastikan selection ada di dalam editor
    const anchorNode = sel.anchorNode;
    const focusNode = sel.focusNode;
    if (!anchorNode || !focusNode) return;
    if (!editor.view.dom.contains(anchorNode) || !editor.view.dom.contains(focusNode)) {
      return;
    }

    const text = sel.toString().trim();
    if (!text) return;

    // Hitung posisi ProseMirror dari DOM selection
    let from: number;
    let to: number;
    try {
      const range = sel.getRangeAt(0);
      from = editor.view.posAtDOM(range.startContainer, range.startOffset);
      to = editor.view.posAtDOM(range.endContainer, range.endOffset);
      if (from > to) {
        const tmp = from;
        from = to;
        to = tmp;
      }
      if (from === to) return;
    } catch {
      return;
    }

    // Posisi toolbar di dekat akhir selection
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setToolbarPos({
      top: rect.top - 12,
      left: rect.right - 40,
    });

    setDraft({
      selectedText: text.slice(0, 500),
      from,
      to,
      comment: "",
      type: "LANGUAGE",
    });
    setCommentText("");
    setCommentType("LANGUAGE");
  };

  // ---- Buka popover dari toolbar ----
  const handleOpenCommentForm = () => {
    if (!draft) return;
    setIsPopoverOpen(true);
  };

  // Terapkan highlight pada editor
  const applyHighlightToEditor = (commentId: string, type: ReviewCommentType) => {
    if (!editor || !draft) return;
    try {
      const { state, view } = editor;
      // Setel selection agar sesuai posisi highlight
      const fromResolved = state.doc.resolve(draft.from);
      const toResolved = state.doc.resolve(draft.to);
      const selection = new TextSelection(fromResolved, toResolved);
      view.dispatch(state.tr.setSelection(selection));
      editor.chain().setHighlightMark({ commentId, type }).run();
    } catch (e) {
      console.error("Gagal menerapkan highlight:", e);
    }
  };

  // ---- Submit komentar ----
  const handleSubmitComment = async () => {
    if (!draft) return;
    if (!commentText.trim()) {
      toast.error("Komentar tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("article_id", articleId);
      fd.append("review_id", reviewId);
      fd.append("selected_text", draft.selectedText);
      fd.append("comment", commentText.trim());
      fd.append("type", commentType);
      fd.append("start_position", JSON.stringify({ pos: draft.from }));
      fd.append("end_position", JSON.stringify({ pos: draft.to }));

      const result = await createReviewComment(fd);
      if (!result.success) {
        toast.error(
          result.error || result.errors?.comment?.[0] || "Gagal menyimpan komentar."
        );
        return;
      }

      const data = result.data as { comment_id?: string } | undefined;
      const commentId = data?.comment_id;
      if (commentId) {
        applyHighlightToEditor(commentId, commentType);
      }

      // Optimistic: tambah ke daftar
      const newComment: ReviewComment = {
        id: commentId ?? `tmp-${Date.now()}`,
        review_id: reviewId,
        article_id: articleId,
        revision_id: "",
        reviewer_id: "",
        selected_text: draft.selectedText,
        comment: commentText.trim(),
        type: commentType,
        start_position: { pos: draft.from },
        end_position: { pos: draft.to },
        status: "OPEN",
        created_at: new Date().toISOString(),
        resolved_at: null,
      };
      setComments((prev) => [...prev, newComment]);

      toast.success("Catatan berhasil ditambahkan.");
      setIsPopoverOpen(false);
      setDraft(null);
      setToolbarPos(null);
      setCommentText("");
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan komentar.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Klik komentar di panel → scroll ke highlight ----
  const handleCommentClick = (comment: ReviewComment) => {
    setActiveCommentId(comment.id);

    if (!editor) return;

    const startPos = comment.start_position as { pos?: number } | null;
    const markPos = findHighlightPos(editor, comment.id);
    const pos = markPos ?? startPos?.pos;

    if (pos != null) {
      try {
        const coords = editor.view.coordsAtPos(pos);
        const container = scrollRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollTop + coords.top - container.getBoundingClientRect().top - 80,
            behavior: "smooth",
          });
        } else {
          window.scrollTo({
            top: window.scrollY + coords.top - 120,
            behavior: "smooth",
          });
        }
      } catch {
        // abaikan
      }
    }

    // Efek ring sementara pada highlight
    if (editor) {
      const found = findHighlightDom(editor, comment.id);
      if (found instanceof HTMLElement) {
        found.classList.add("review-highlight-active");
        window.setTimeout(() => {
          found.classList.remove("review-highlight-active");
        }, 2000);
      }
    }
  };

  // Cari posisi mark berdasarkan commentId
  const findHighlightPos = (ed: Editor, commentId: string): number | null => {
    let found: number | null = null;
    ed.state.doc.descendants((node, pos) => {
      if (found !== null) return false;
      node.marks.forEach((mark) => {
        if (
          mark.type.name === "highlightMark" &&
          mark.attrs.commentId === commentId
        ) {
          found = pos;
        }
      });
      return found === null;
    });
    return found;
  };

  // Cari elemen DOM mark
  const findHighlightDom = (ed: Editor, commentId: string): Node | null => {
    const pos = findHighlightPos(ed, commentId);
    if (pos == null) return null;
    return ed.view.domAtPos(pos).node;
  };

  // ---- Minta Revisi ----
  const handleRequestRevision = async () => {
    if (comments.length === 0 && !generalText.trim()) {
      toast.error(
        "Tambahkan minimal satu catatan atau alasan umum sebelum meminta revisi."
      );
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("article_id", articleId);
      fd.append("review_id", reviewId);
      if (generalText.trim()) fd.append("general_comment", generalText.trim());

      const result = await requestRevision(fd);
      if (!result.success) {
        toast.error(result.error || "Gagal meminta revisi.");
        return;
      }
      toast.success("Revisi diminta. Santri akan menerima notifikasi.");
      router.push("/dashboard/teacher");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat meminta revisi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Setujui Artikel ----
  const handleApprove = async () => {
    if (
      !window.confirm(
        "Yakin ingin menyetujui artikel ini? Artikel akan langsung dipublikasikan."
      )
    )
      return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("article_id", articleId);
      fd.append("review_id", reviewId);

      const result = await approveArticle(fd);
      if (!result.success) {
        toast.error(result.error || "Gagal menyetujui artikel.");
        return;
      }
      toast.success("Artikel disetujui dan dipublikasikan!");
      router.push("/dashboard/teacher");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat menyetujui artikel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)]">
      {/* Header artikel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/teacher")}
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-heading text-lg font-semibold truncate">
              {articleTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              oleh {authorName}
              {categoryName ? ` • ${categoryName}` : ""}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-transparent"
        >
          Sedang Direview
        </Badge>
      </div>

      {/* Dua kolom: artikel + panel komentar */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Kolom kiri: artikel (read-only) */}
        <div ref={scrollRef} className="flex-1 lg:overflow-y-auto min-w-0 p-4 lg:pr-6">
          <div className="mx-auto max-w-3xl bg-card border border-border rounded-xl shadow-sm p-6 lg:p-8">
            <style jsx global>{`
              .review-editor-content {
                outline: none;
                font-size: 1rem;
                line-height: 1.75;
                color: var(--foreground);
              }
              .review-editor-content p {
                margin: 0 0 0.75rem 0;
              }
              .review-editor-content h1,
              .review-editor-content h2,
              .review-editor-content h3 {
                font-weight: 600;
                margin: 1.5rem 0 0.75rem 0;
                line-height: 1.3;
              }
              .review-editor-content h1 { font-size: 1.5rem; }
              .review-editor-content h2 { font-size: 1.3rem; }
              .review-editor-content h3 { font-size: 1.1rem; }
              .review-editor-content a {
                color: var(--primary);
                text-decoration: underline;
              }
              .review-editor-content blockquote {
                border-left: 3px solid var(--border);
                padding-left: 1rem;
                font-style: italic;
                color: var(--muted-foreground);
                margin: 0.75rem 0;
              }
              .review-editor-content ul {
                list-style: disc;
                padding-left: 1.5rem;
                margin: 0.5rem 0;
              }
              .review-editor-content ol {
                list-style: decimal;
                padding-left: 1.5rem;
                margin: 0.5rem 0;
              }
              .review-editor-content img {
                max-width: 100%;
                height: auto;
                border-radius: 0.5rem;
                margin: 0.75rem 0;
              }
              .review-editor-content ::selection {
                background: rgba(59, 130, 246, 0.3);
              }
              .review-editor-content mark[data-comment-id] {
                transition: box-shadow 0.2s ease;
              }
              .review-editor-content mark.review-highlight-active {
                box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
              }
            `}</style>
            <EditorContent editor={editor} />
          </div>

          {/* Komentar umum */}
          <div className="mx-auto max-w-3xl mt-4">
            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
              <button
                type="button"
                onClick={() => setShowGeneralComment((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ScrollText className="h-4 w-4" />
                {showGeneralComment
                  ? "Sembunyikan komentar umum"
                  : "Tulis komentar umum untuk santri"}
              </button>
              {showGeneralComment && (
                <div className="mt-3">
                  <Textarea
                    value={generalText}
                    onChange={(e) => setGeneralText(e.target.value)}
                    placeholder="Komentar umum / pesan keseluruhan untuk santri..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom kanan: panel komentar */}
        <div className="w-full lg:w-[380px] lg:border-l border-border flex flex-col bg-card lg:overflow-y-auto shrink-0">
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="font-heading font-semibold flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
              Catatan Review
              <span className="text-sm text-muted-foreground font-normal">
                ({comments.length})
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Blok teks pada artikel, lalu pilih &quot;Beri Catatan&quot;.
            </p>
          </div>
          <div className="flex-1 p-4">
            <ReviewCommentPanel
              comments={comments}
              onCommentClick={handleCommentClick}
              activeCommentId={activeCommentId}
            />
          </div>
        </div>
      </div>

      {/* Footer aksi */}
      <div className="border-t border-border p-4 flex flex-wrap items-center justify-between gap-3 bg-card shrink-0">
        <p className="text-xs text-muted-foreground">
          {comments.length} catatan • artikel akan dipublikasikan jika disetujui
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRequestRevision}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <AlertTriangle className="h-4 w-4 mr-2" />
            Minta Revisi
          </Button>
          <Button onClick={handleApprove} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Setujui Artikel
          </Button>
        </div>
      </div>

      {/* Popover komentar — trigger = floating toolbar */}
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open) => {
          setIsPopoverOpen(open);
          // Bersihkan draft/toolbar saat popover ditutup (klik luar, submit, atau batal).
          // Catatan: jangan pakai mousedown manual di luar — Radix Select di-render
          // via portal, jadi klik pada opsi dropdown tidak berada dalam elemen popover.
          if (!open) {
            setDraft(null);
            setToolbarPos(null);
            setCommentText("");
          }
        }}
      >
        {draft && toolbarPos && (
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              data-review-toolbar
              className="fixed z-50 shadow-lg"
              style={{ top: toolbarPos.top, left: toolbarPos.left }}
              onClick={handleOpenCommentForm}
            >
              <PenLine className="h-4 w-4 mr-1.5" />
              Beri Catatan
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent
          data-review-popover
          className="w-[320px] sm:w-[360px]"
          align="start"
          side="top"
          sideOffset={8}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Teks yang dipilih
              </Label>
              <blockquote className="text-xs italic text-muted-foreground border-l-2 border-primary/40 pl-2 py-1 line-clamp-3 bg-muted/50 rounded-r-md">
                &quot;{draft?.selectedText}&quot;
              </blockquote>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Jenis masalah
              </Label>
              <Select
                value={commentType}
                onValueChange={(v) => setCommentType(v as ReviewCommentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_COMMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: REVIEW_COMMENT_TYPE_COLORS[t] }}
                        />
                        {REVIEW_COMMENT_TYPE_LABELS[t]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Komentar
              </Label>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tulis catatan untuk bagian ini..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsPopoverOpen(false);
                  setDraft(null);
                  setToolbarPos(null);
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitComment}
                disabled={saving || !commentText.trim()}
              >
                {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Simpan Catatan
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}