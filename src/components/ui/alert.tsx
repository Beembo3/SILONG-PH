import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = {
  info: {
    className: "border-[#b9d2d1] bg-[#eef5f3] text-[#123b2e]",
    iconClass: "bg-[#dcebe7] text-[#175e68]",
    Icon: Info,
  },
  success: {
    className: "border-[#bfd4c5] bg-[#eef5ee] text-[#123b2e]",
    iconClass: "bg-[#dfecdf] text-[#2c6a4b]",
    Icon: CheckCircle2,
  },
  warning: {
    className: "border-[#e2c48e] bg-[#fbf1dc] text-[#3d2a08]",
    iconClass: "bg-[#f5e2bd] text-[#8a4b00]",
    Icon: TriangleAlert,
  },
  danger: {
    className: "border-[#dfb1ac] bg-[#fbeceb] text-[#3f1210]",
    iconClass: "bg-[#f3d8d5] text-[#b3261e]",
    Icon: AlertCircle,
  },
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants;
  title?: string;
}

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const { className: variantClass, iconClass, Icon } = alertVariants[variant];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-[var(--radius-lg)] border p-4 text-sm", variantClass, className)}
      {...props}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconClass)}>
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <div className="min-w-0 space-y-1 break-words">
        {title ? <p className="font-display text-[0.95rem] font-bold leading-snug">{title}</p> : null}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
