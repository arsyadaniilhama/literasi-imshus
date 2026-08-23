import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo, formatDate } from "@/lib/utils";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { created_at: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const actionBadge = (action: string) => {
    if (action.includes("DELETE") || action.includes("DELETED")) {
      return <Badge variant="destructive">{action.replace(/_/g, " ").toLowerCase()}</Badge>;
    }
    if (action.includes("CREATE") || action.includes("CREATED")) {
      return <Badge>{action.replace(/_/g, " ").toLowerCase()}</Badge>;
    }
    if (action.includes("UPDATE") || action.includes("UPDATED")) {
      return <Badge variant="secondary">{action.replace(/_/g, " ").toLowerCase()}</Badge>;
    }
    return <Badge variant="outline">{action.replace(/_/g, " ").toLowerCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">
          Catatan aktivitas seluruh pengguna platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada aktivitas
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <ScrollText className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{log.user?.name ?? "System"}</p>
                      {actionBadge(log.action)}
                    </div>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {log.entity_type.replace(/_/g, " ")} •{" "}
                      {log.entity_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)} • {timeAgo(log.created_at)}
                    </p>
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
