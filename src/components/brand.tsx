import Link from "next/link";
import { SilongMark, SilongWordmark } from "@/components/silong-mark";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  compact = false,
  onDark = false,
  hideTaglineOnMobile = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
  hideTaglineOnMobile?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-full focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <span className="inline-flex shrink-0 transition-transform duration-300 group-hover:-rotate-3">
        <SilongMark className="h-10 w-10 shadow-[0_8px_18px_-12px_rgba(18,59,46,0.85)]" />
      </span>
      {!compact ? (
        <span className="leading-none">
          <SilongWordmark onDark={onDark} />
          <span
            className={cn(
              "mt-1.5 block text-[9px] font-bold uppercase tracking-[0.18em]",
              onDark ? "text-[#c6d6c9]" : "text-muted-foreground",
              hideTaglineOnMobile && "hidden min-[360px]:block",
            )}
          >
            Kaligtasan sa init
          </span>
        </span>
      ) : null}
      <span className="sr-only">— pumunta sa home</span>
    </Link>
  );
}
