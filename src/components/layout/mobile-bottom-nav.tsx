"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Map, MapPin, Siren, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", Icon: Sun },
  { href: "/map", label: "Mapa", Icon: Map },
  { href: "/cool-places", label: "Lugar", Icon: MapPin },
  { href: "/preparedness", label: "Handa", Icon: BookOpen },
  { href: "/alerts", label: "Babala", Icon: Siren },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [formFocused, setFormFocused] = useState(false);

  // A fixed bottom bar can sit on top of the submit button while the virtual
  // keyboard is open. Hide it while a form control has focus.
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName === "TEXTAREA") {
        setFormFocused(true);
        return;
      }
      if (target.tagName === "INPUT") {
        const type = (target as HTMLInputElement).type;
        // Only controls that open the virtual keyboard need the bar hidden.
        if (!["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "date", "time", "datetime-local", "month", "week"].includes(type)) {
          setFormFocused(true);
        }
      }
    };
    const onFocusOut = () => setFormFocused(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (formFocused) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-ivory/96 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-[0_-12px_32px_-26px_rgba(18,59,46,0.55)] backdrop-blur-xl lg:hidden"
      aria-label="Mabilisang navigation"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-15 flex-col items-center justify-center gap-1 px-1 pb-1 pt-2 text-[10px] font-extrabold leading-tight tracking-[0.01em]",
                  active ? "text-forest" : "text-[#536258]",
                )}
              >
                {active ? (
                  <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-sun" aria-hidden="true" />
                ) : null}
                <span
                  className={cn(
                    "flex h-8 w-9 items-center justify-center rounded-full transition-colors",
                    active ? "bg-[#e5eee3]" : "bg-transparent",
                  )}
                >
                  <Icon className={cn("h-[19px] w-[19px]", active && "text-canopy")} aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
