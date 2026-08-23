import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="relative flex-1 max-w-sm">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} size="sm" className="overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <CardContent className="py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-3/4" />
              <Skeleton className="mt-4 h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}