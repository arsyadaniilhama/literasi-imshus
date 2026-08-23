import { Badge } from "@/components/ui/badge";
import {
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  type ArticleStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal border-transparent", ARTICLE_STATUS_COLORS[status])}
    >
      {ARTICLE_STATUS_LABELS[status]}
    </Badge>
  );
}
