"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, ClipboardList, FileWarning, Gauge, ScrollText, ShieldAlert, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/places", label: "Cool places", icon: Building2 },
  { href: "/admin/reports", label: "Reports", icon: FileWarning },
  { href: "/admin/alerts", label: "Official alerts", icon: ShieldAlert },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/health", label: "System health", icon: Activity },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  function active(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (variant === "mobile") {
    return (
      <nav aria-label="Administration" className="flex items-center gap-1 overflow-x-auto pb-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              active(href)
                ? "bg-orange-50 text-orange-900"
                : "text-slate-600 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Administration" className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            active(href)
              ? "bg-orange-50 text-orange-900"
              : "text-slate-600 hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </Link>
      ))}
      <div className="pt-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-muted hover:text-foreground"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Public site
        </Link>
      </div>
    </nav>
  );
}
