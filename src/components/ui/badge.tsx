import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none tracking-[0.01em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-forest text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-card text-foreground",
        success: "border-[#b8d2c1] bg-[#edf5ee] text-[#24563c]",
        warning: "border-[#e4c792] bg-[#fbf1dc] text-[#7a4300]",
        danger: "border-[#e3b6b1] bg-[#fbeceb] text-[#8f1f18]",
        info: "border-[#b5d1d2] bg-[#edf5f4] text-[#15525b]",
        orange: "border-[#e7c28f] bg-[#fbf0dd] text-[#7a4300]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
