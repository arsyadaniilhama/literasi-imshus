import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mx-auto mt-4 h-10 w-64" />
        <Skeleton className="mx-auto mt-4 h-6 w-3/4" />
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 text-center">
            <Skeleton className="mx-auto h-12 w-12 rounded-full" />
            <Skeleton className="mt-4 h-5 w-24" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-xl border p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
      </div>
    </div>
  );
}