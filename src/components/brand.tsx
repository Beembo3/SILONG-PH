import Image from "next/image";
import Link from "next/link";
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
      className={cn("inline-flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label="Home ng SILONG PH"
    >
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
        <Image
          src="/logo.png"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          loading="eager"
          className="h-10 w-10 object-contain"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))" }}
        />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span
            className={cn(
              "block text-[15px] font-extrabold tracking-tight",
              onDark ? "text-white" : "text-navy",
            )}
          >
            SILONG PH
          </span>
          <span
            className={cn(
              "mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em]",
              onDark ? "text-slate-300" : "text-muted-foreground",
              hideTaglineOnMobile && "hidden min-[360px]:block",
            )}
          >
            Kaligtasan sa init
          </span>
        </span>
      ) : null}
    </Link>
  );
}
