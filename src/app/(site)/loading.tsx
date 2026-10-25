import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="bg-navy px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="h-12 w-2/3 bg-white/10" />
          <Skeleton className="h-24 w-1/2 bg-white/10" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <Skeleton className="h-56 md:col-span-2" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
