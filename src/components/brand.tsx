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
      <span className={cn("relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm", !compact && "overflow-hidden")}>
        <img
          src="/logo.png"
          alt="SILONG PH"
          className="h-10 w-10 object-contain"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement as HTMLElement)?.insertAdjacentHTML("beforeend", `<span class="h-6 w-6 text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg></span>`); }}
        />
        <Sun className="h-6 w-6 text-white absolute -z-10 opacity-0" aria-hidden="true" />
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
