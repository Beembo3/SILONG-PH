import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="border-b border-orange-100 bg-gradient-to-b from-orange-50 to-surface px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-48 w-full max-w-3xl" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <Skeleton className="h-40 md:col-span-2" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
