"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Map, MapPin, Siren, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", Icon: Sun },
  { href: "/map", label: "Map", Icon: Map },
  { href: "/cool-places", label: "Cool places", Icon: MapPin },
  { href: "/preparedness", label: "Prepare", Icon: BookOpen },
  { href: "/alerts", label: "Alerts", Icon: Siren },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Quick navigation"
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
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-semibold",
                  active ? "text-orange-700" : "text-slate-500",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
