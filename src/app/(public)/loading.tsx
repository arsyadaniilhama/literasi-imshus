import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center">
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
            <Skeleton className="mx-auto mt-6 h-12 w-3/4 sm:h-14" />
            <Skeleton className="mx-auto mt-4 h-5 w-2/3" />
            <Skeleton className="mx-auto mt-8 h-11 w-full max-w-xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Latest articles skeleton */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
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
      </section>
    </div>
  );
}
