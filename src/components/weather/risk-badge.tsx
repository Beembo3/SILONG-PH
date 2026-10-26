import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeatRiskCategory } from "@/lib/heat-index";

export function RiskBadge({
  category,
  className,
}: {
  category: HeatRiskCategory;
  className?: string;
}) {
  const styles: Record<HeatRiskCategory["tone"], string> = {
    neutral: "border-slate-300 bg-slate-100 text-slate-800",
    yellow: "border-amber-300 bg-amber-100 text-amber-900",
    orange: "border-orange-300 bg-orange-100 text-orange-900",
    red: "border-red-300 bg-red-100 text-red-900",
    critical: "border-red-700 bg-red-700 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        styles[category.tone],
        className,
      )}
    >
      {category.tone === "red" || category.tone === "critical" ? (
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
      ) : category.tone === "orange" ? (
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      ) : null}
      <span title={`PAGASA category: ${category.label}`}>{category.taglishLabel}</span>
    </span>
  );
}
