import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = {
  info: { className: "border-blue-200 bg-blue-50 text-blue-950", Icon: Info },
  success: { className: "border-green-200 bg-green-50 text-green-950", Icon: CheckCircle2 },
  warning: { className: "border-amber-300 bg-amber-50 text-amber-950", Icon: TriangleAlert },
  danger: { className: "border-red-300 bg-red-50 text-red-950", Icon: AlertCircle },
} as const;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants;
  title?: string;
}

export function Alert({ className, variant = "info", title, children, ...props }: AlertProps) {
  const { className: variantClass, Icon } = alertVariants[variant];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4 text-sm", variantClass, className)}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
