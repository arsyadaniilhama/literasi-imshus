import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { REVIEW_DECISION_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    take: 50,
    orderBy: { created_at: "desc" },
    include: {
      article: { select: { id: true, title: true } },
      reviewer: { select: { id: true, name: true } },
    },
  });

  const getDecisionVariant = (decision: string) => {
    switch (decision) {
      case "APPROVED":
        return "outline" as const;
      case "REVISION_REQUIRED":
        return "destructive" as const;
      case "IN_REVIEW":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kelola Review</h1>
        <p className="text-muted-foreground">
          Daftar review artikel dari para guru
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Review</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada review
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {review.article?.title ?? "Artikel dihapus"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reviewer: {review.reviewer?.name ?? "-"} •{" "}
                      {timeAgo(review.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={getDecisionVariant(review.decision)}>
                      {REVIEW_DECISION_LABELS[review.decision]}
                    </Badge>
                    <Link
                      href={`/dashboard/admin/articles`}
                      className="text-sm text-primary hover:underline"
                    >
                      Buka
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
