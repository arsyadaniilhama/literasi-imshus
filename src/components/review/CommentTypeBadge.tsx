import { Badge } from "@/components/ui/badge";
import {
  REVIEW_COMMENT_TYPE_LABELS,
  REVIEW_COMMENT_TYPE_LIGHT_BG,
  type ReviewCommentType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CommentTypeBadge({ type }: { type: ReviewCommentType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal border-transparent",
        REVIEW_COMMENT_TYPE_LIGHT_BG[type]
      )}
    >
      {REVIEW_COMMENT_TYPE_LABELS[type]}
    </Badge>
  );
}
