"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CommentTypeBadge } from "@/components/review/CommentTypeBadge";
import {
  REVIEW_COMMENT_TYPE_COLORS,
  REVIEW_COMMENT_TYPE_DOT,
} from "@/lib/constants";
import type { ReviewComment, ReviewCommentType } from "@/types";

interface ReviewCommentPanelProps {
  comments: ReviewComment[];
  onCommentClick?: (comment: ReviewComment) => void;
  activeCommentId?: string | null;
}

export function ReviewCommentPanel({
  comments,
  onCommentClick,
  activeCommentId,
}: ReviewCommentPanelProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
        <div className="mb-4 text-4xl">💬</div>
        <p className="text-lg font-medium">Belum ada catatan</p>
        <p className="text-sm mt-1">
          Blok teks pada artikel lalu klik &quot;Beri Catatan&quot; untuk menambahkan komentar.
        </p>
      </div>
    );
  }

  // Sortir komentar berdasarkan posisi di dokumen
  const sortedComments = [...comments].sort((a, b) => {
    const aPos = a.start_position as { pos?: number } | undefined;
    const bPos = b.start_position as { pos?: number } | undefined;
    return (aPos?.pos ?? 0) - (bPos?.pos ?? 0);
  });

  return (
    <div className="overflow-y-auto h-full">
      <div className="space-y-3 pb-4">
        {sortedComments.map((comment) => (
          <ReviewCommentCard
            key={comment.id}
            comment={comment}
            onClick={onCommentClick}
            isSelected={activeCommentId === comment.id}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCommentCard({
  comment,
  onClick,
  isSelected = false,
}: {
  comment: ReviewComment;
  onClick?: (comment: ReviewComment) => void;
  isSelected?: boolean;
}) {
  const type = comment.type as ReviewCommentType;
  const dotColor = REVIEW_COMMENT_TYPE_DOT[type] || "bg-teal-500";

  const handleClick = () => {
    onClick?.(comment);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 transition-all cursor-pointer",
        "hover:shadow-md hover:border-primary/30",
        isSelected && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
      )}
      onClick={handleClick}
      data-comment-id={comment.id}
    >
      {/* Baris atas: teks terpilih + badge jenis */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-muted-foreground line-clamp-2">
            &quot;{comment.selected_text}&quot;
          </p>
        </div>
        <CommentTypeBadge type={type} />
      </div>

      {/* Isi komentar */}
      <div className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words">
        {comment.comment}
      </div>

      {/* Baris bawah: posisi + waktu */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span
            className={cn("size-1.5 rounded-full", dotColor)}
            aria-hidden="true"
          />
          <span className="font-mono">
            {comment.start_position &&
            typeof comment.start_position === "object" &&
            "pos" in comment.start_position
              ? `pos: ${(comment.start_position as { pos: number }).pos}`
              : "pos: -"}
          </span>
        </span>
        <time dateTime={comment.created_at}>
          {new Date(comment.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      {/* Petunjuk klik */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-muted-foreground/60">Klik untuk lompat</span>
      </div>
    </div>
  );
}

// ============================================================
// Referensi warna — tersedia untuk panel luar jika diperlukan
// ============================================================
export { REVIEW_COMMENT_TYPE_COLORS };