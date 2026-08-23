import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetailLoading() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-5 w-24 rounded-full" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-3 h-6 w-3/4" />
      <Skeleton className="mt-6 h-5 w-full border-y" />
      <Skeleton className="mt-8 aspect-[16/9] w-full rounded-xl" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </article>
  );
}