import Link from "next/link";
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label="SILONG PH home"
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
        <Sun className="h-6 w-6" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-tight text-navy">SILONG PH</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Central Luzon heat safety
          </span>
        </span>
      ) : null}
    </Link>
  );
}
