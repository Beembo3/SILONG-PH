"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);

  // iOS Safari keeps the layout viewport at full height while the keyboard
  // covers the bottom of the screen. Lift the bottom sheet above the keyboard
  // so the focused field and submit button remain reachable.
  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        setKeyboardOffset(0);
        return;
      }
      const covered = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(covered > 120 ? Math.round(covered) : 0);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-[2px] data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // On phones, dialogs become bottom sheets so they stay inside the
          // visual viewport, clear the virtual keyboard, and respect safe areas.
          "fixed inset-x-0 bottom-0 top-auto z-50 max-h-[85dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl border border-border bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl",
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6",
          className,
        )}
        style={{
          ...style,
          ...(keyboardOffset > 0
            ? {
                bottom: `${keyboardOffset}px`,
                maxHeight: `calc(100dvh - ${keyboardOffset + 16}px)`,
              }
            : null),
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Isara ang dialog"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = "DialogContent";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-bold text-navy", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("mt-1 text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
