import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-8 h-10 w-full" />
      <Skeleton className="mt-2 h-6 w-3/4" />
      <div className="mt-8 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} size="sm" className="overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full rounded-t-xl" />
            <CardContent className="py-4">
              <Skeleton className="h-4 w-20" />
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