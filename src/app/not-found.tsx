import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The page or record you requested does not exist. It may have been moved or archived.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">Return to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cool-places">Browse cool places</Link>
        </Button>
      </div>
    </div>
  );
}
