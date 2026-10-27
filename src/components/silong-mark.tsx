import { cn } from "@/lib/utils";

/**
 * SILONG PH mark: a sun resting above a layered canopy. The canopy forms a
 * sheltering arch while the small ground line keeps the mark legible at 24px.
 */
export function SilongMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="14" fill="var(--forest)" />
      <circle cx="33.5" cy="14.5" r="6" fill="var(--sun)" />
      <g stroke="var(--sun)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M33.5 3.8v3.1" />
        <path d="M41.2 6.8l-2.2 2.2" />
        <path d="M44.4 14.5h-3.1" />
      </g>
      <path
        d="M4.8 28.2C9.8 18.1 16.5 13 24 13s14.2 5.1 19.2 15.2l-2.3 7.2C36.5 27.1 30.7 23.1 24 23.1S11.5 27.1 7.1 35.4L4.8 28.2Z"
        fill="var(--ivory)"
      />
      <path
        d="M8.1 37.2c5.2-5.2 10.5-7.7 15.9-7.7s10.7 2.5 15.9 7.7"
        stroke="var(--leaf)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M15.8 41.4h16.4"
        stroke="var(--ivory)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity=".72"
      />
    </svg>
  );
}

export function SilongWordmark({
  onDark = false,
  className,
}: {
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("font-display text-[17px] font-extrabold leading-none tracking-[-0.045em]", className)}>
      <span className={onDark ? "text-primary-foreground" : "text-forest"}>SILONG</span>{" "}
      <span className={onDark ? "text-sun" : "text-sun-ink"}>PH</span>
    </span>
  );
}
