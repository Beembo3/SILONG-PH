import { AlertTriangle, ShieldAlert, Sun } from "lucide-react";
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
    neutral: "border-[#bfcbbf] bg-[#edf1e9] text-[#2d4c3b]",
    yellow: "border-[#e2c48e] bg-[#fbf1dc] text-[#6f3d00]",
    orange: "border-[#e4b27d] bg-[#fbe9d6] text-[#71330d]",
    red: "border-[#dfb1ac] bg-[#fbeceb] text-[#8f1f18]",
    critical: "border-[#8f2018] bg-[#8f2018] text-white",
  };
  const Icon = category.tone === "critical" || category.tone === "red" ? ShieldAlert : category.tone === "orange" ? AlertTriangle : Sun;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold leading-none",
        styles[category.tone],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span title={`PAGASA category: ${category.label}`}>{category.taglishLabel}</span>
    </span>
  );
}
