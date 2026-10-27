import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-bold tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_rgba(18,59,46,0.9)] hover:bg-canopy",
        accent:
          "bg-accent text-accent-foreground shadow-[0_10px_24px_-16px_rgba(138,75,0,0.75)] hover:bg-[#f6c46d]",
        navy: "bg-forest text-primary-foreground shadow-[0_10px_24px_-16px_rgba(18,59,46,0.9)] hover:bg-navy",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[#ddd2bd]",
        outline:
          "border border-border bg-card text-foreground shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] hover:border-sage hover:bg-surface",
        inverse:
          "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/15",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-danger text-white shadow-[0_10px_24px_-16px_rgba(179,38,30,0.8)] hover:bg-[#922019]",
        success: "bg-success text-white hover:bg-[#23583e]",
        link: "min-h-0 rounded-none p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-11 min-h-11 px-4 text-xs",
        lg: "h-13 min-h-13 px-7 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
