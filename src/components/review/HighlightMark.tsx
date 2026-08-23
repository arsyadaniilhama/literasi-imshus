import { Mark, mergeAttributes } from "@tiptap/core";
import { REVIEW_COMMENT_TYPE_COLORS } from "@/lib/constants";
import type { ReviewCommentType } from "@/types";

// ============================================================
// ProseMirror Mark — Highlight untuk review artikel
// ============================================================

export interface HighlightMarkOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlightMark: {
      setHighlightMark: (attributes: {
        commentId: string;
        type: ReviewCommentType;
      }) => ReturnType;
      unsetHighlightMark: () => ReturnType;
    };
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const HighlightMark = Mark.create<HighlightMarkOptions>({
  name: "highlightMark",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-comment-id"),
        renderHTML: (attrs) => {
          if (!attrs.commentId) return {};
          return { "data-comment-id": attrs.commentId };
        },
      },
      type: {
        default: "OTHER",
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-highlight-type") || "OTHER",
        renderHTML: (attrs) => {
          if (!attrs.type) return {};
          return { "data-highlight-type": attrs.type };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark[data-comment-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = (HTMLAttributes.type as ReviewCommentType) || "OTHER";
    const color = REVIEW_COMMENT_TYPE_COLORS[type] || "#14b8a6";
    const bg = hexToRgba(color, 0.25);
    const borderColor = hexToRgba(color, 0.5);

    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: `background-color: ${bg}; border-bottom: 2px solid ${borderColor}; cursor: pointer; border-radius: 2px;`,
        "data-comment-id": HTMLAttributes.commentId,
        "data-highlight-type": type,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setHighlightMark:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetHighlightMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});