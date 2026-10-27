import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageMasthead({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-forest text-primary-foreground", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines opacity-90" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-40 hidden h-96 w-96 rounded-full border-[2.5rem] border-white/[0.045] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-20 top-10 hidden h-24 w-24 rounded-full bg-sun/85 blur-[1px] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-14 top-6 hidden h-44 w-44 rounded-full border border-sun/25 lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-11 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0 max-w-3xl">
            {backHref ? (
              <Link
                href={backHref}
                className="mb-5 flex min-h-11 w-fit items-center gap-2 text-xs font-bold text-[#c8d7ca] transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {backLabel ?? "Bumalik"}
              </Link>
            ) : null}
            <p className="eyebrow text-sun">{eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-balance font-display text-[clamp(2.15rem,5.2vw,3.9rem)] font-bold leading-[0.98] tracking-[-0.045em]">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-7 text-[#c8d7ca] sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div> : null}
        </div>
        {children ? <div className="mt-7 sm:mt-9">{children}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  className,
  onDark = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <p className={cn("eyebrow", onDark ? "text-sun" : "text-sun-ink")}>
            <span className={cn("h-px w-5", onDark ? "bg-sun" : "bg-sun-ink")} aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className={cn(
            "mt-2 text-balance font-display text-[clamp(1.55rem,3.2vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.04em]",
            onDark ? "text-primary-foreground" : "text-forest",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2.5 max-w-xl text-pretty text-sm leading-7 sm:text-[15px]",
              onDark ? "text-[#c8d7ca]" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="min-w-0 max-w-full sm:shrink-0">{action}</div> : null}
    </div>
  );
}
