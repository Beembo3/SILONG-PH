"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy">This page could not be loaded</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The problem has been logged. No fabricated data has been shown in place of the failed content.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
