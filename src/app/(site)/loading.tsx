import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="relative overflow-hidden bg-forest px-4 py-10 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines opacity-80" />
        <div className="relative mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-3 w-32 bg-white/15" />
          <Skeleton className="h-12 w-full max-w-xl bg-white/15" />
          <Skeleton className="h-5 w-full max-w-2xl bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="-mt-14 space-y-4 sm:-mt-16">
          <Skeleton className="h-64 w-full rounded-[2rem] bg-card/90" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-52 md:col-span-2" />
            <Skeleton className="h-52" />
          </div>
        </div>
      </div>
    </div>
  );
}
