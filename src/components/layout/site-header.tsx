"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocationPicker } from "@/components/location/location-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Heat Map" },
  { href: "/cool-places", label: "Cool Places" },
  { href: "/preparedness", label: "Preparedness" },
  { href: "/alerts", label: "Alerts" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActive(pathname, item.href)
                  ? "bg-orange-50 text-orange-800"
                  : "text-slate-600 hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <LocationPicker />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle>Menu</DialogTitle>
              <div className="mt-4 space-y-3">
                <LocationPicker />
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-lg px-3 py-3 text-sm font-semibold",
                        isActive(pathname, item.href)
                          ? "bg-orange-50 text-orange-800"
                          : "text-slate-700 hover:bg-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 sm:hidden">
        <LocationPicker />
      </div>
    </header>
  );
}
