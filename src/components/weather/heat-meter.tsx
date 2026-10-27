import type { HeatRiskCategory } from "@/lib/heat-index";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const SCALE_MIN = 20;
const SCALE_MAX = 58;
const SEGMENTS = [
  { from: 20, to: 27, color: "#b9c9bb", label: "Mababa sa alert level" },
  { from: 27, to: 33, color: "#e3b24f", label: "Mag-ingat" },
  { from: 33, to: 42, color: "#d27a32", label: "Sobrang mag-ingat" },
  { from: 42, to: 52, color: "#bd4b36", label: "Mapanganib" },
  { from: 52, to: 58, color: "#8f2018", label: "Sobrang mapanganib" },
];

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: 130 + radius * Math.cos(rad), y: 124 + radius * Math.sin(rad) };
}

function arcPath(from: number, to: number, radius: number) {
  const start = 180 + ((from - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 180;
  const end = 180 + ((to - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 180;
  const a = polar(start, radius);
  const b = polar(end, radius);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export function HeatMeter({
  category,
  valueC,
  className,
  compact = false,
}: {
  category: HeatRiskCategory;
  valueC: number | null | undefined;
  className?: string;
  compact?: boolean;
}) {
  const safeValue = valueC == null || !Number.isFinite(valueC) ? null : Math.min(SCALE_MAX, Math.max(SCALE_MIN, valueC));
  const markerAngle = safeValue == null ? 180 : 180 + ((safeValue - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 180;
  const marker = polar(markerAngle, 96);
  const ariaValue = safeValue == null ? "hindi available" : `${formatNumber(valueC, 1)} degrees Celsius`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox="0 0 260 150"
        className={cn("mx-auto block w-full", compact ? "max-w-[220px]" : "max-w-[280px]")}
        role="img"
        aria-label={`Tinatayang heat index: ${ariaValue}. Kategorya: ${category.taglishLabel}.`}
      >
        <path
          d={arcPath(SCALE_MIN, SCALE_MAX, 96)}
          fill="none"
          stroke="var(--sand)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {SEGMENTS.map((segment) => (
          <path
            key={segment.from}
            d={arcPath(segment.from, segment.to, 96)}
            fill="none"
            stroke={segment.color}
            strokeWidth="18"
            strokeLinecap="butt"
          />
        ))}
        <path
          d={arcPath(SCALE_MIN, SCALE_MAX, 96)}
          fill="none"
          stroke="rgba(255,255,255,.22)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        {safeValue != null ? (
          <g>
            <circle cx={marker.x} cy={marker.y} r="10" fill="var(--card)" stroke="var(--forest)" strokeWidth="3" />
            <circle cx={marker.x} cy={marker.y} r="3.5" fill="var(--forest)" />
          </g>
        ) : null}
        <text
          x="130"
          y="82"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1.2"
        >
          TINATAYANG HEAT INDEX
        </text>
        <text
          x="130"
          y="112"
          textAnchor="middle"
          fill="var(--forest)"
          fontFamily="var(--font-bricolage), var(--font-manrope), sans-serif"
          fontSize="36"
          fontWeight="700"
          letterSpacing="-1.5"
        >
          {safeValue == null ? "—" : formatNumber(valueC, 1)}
          <tspan fill="var(--muted-foreground)" fontSize="13" fontWeight="700" letterSpacing="0">
            {" "}°C
          </tspan>
        </text>
        <text x="24" y="146" textAnchor="start" fill="var(--muted-foreground)" fontSize="8.5" fontWeight="700">
          MAS MALAMIG
        </text>
        <text x="236" y="146" textAnchor="end" fill="var(--muted-foreground)" fontSize="8.5" fontWeight="700">
          MAS MAINIT
        </text>
      </svg>
      <p className="sr-only">
        {SEGMENTS.map((segment) => segment.label).join(", ")}. Kasalukuyang kategorya: {category.taglishLabel}.
      </p>
    </div>
  );
}
