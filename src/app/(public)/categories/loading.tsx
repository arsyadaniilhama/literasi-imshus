import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mx-auto mt-4 h-10 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}