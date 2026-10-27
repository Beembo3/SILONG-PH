"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Map, MapPin, Menu, ShieldCheck, Siren } from "lucide-react";
import { Brand } from "@/components/brand";
import { LocationPicker } from "@/components/location/location-picker";
import { InstallAppButton } from "@/components/pwa/install-app";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: ShieldCheck },
  { href: "/map", label: "Mapa ng init", Icon: Map },
  { href: "/cool-places", label: "Preskong lugar", Icon: MapPin },
  { href: "/preparedness", label: "Paghahanda", Icon: BookOpen },
  { href: "/alerts", label: "Mga babala", Icon: Siren },
  { href: "/about", label: "Tungkol", Icon: ShieldCheck },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/75 bg-ivory/92 backdrop-blur-xl supports-[backdrop-filter]:bg-ivory/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Brand hideTaglineOnMobile />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Pangunahing navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-[13px] font-bold tracking-[-0.01em] transition-colors",
                  active
                    ? "text-forest"
                    : "text-[#536258] hover:bg-card/80 hover:text-forest",
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-sun transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LocationPicker />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Buksan ang menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle>Menu</DialogTitle>
              <div className="mt-4 space-y-4">
                <LocationPicker />
                <nav className="space-y-1" aria-label="Navigation sa mobile">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.Icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
                          active
                            ? "bg-[#e9f0e8] text-forest"
                            : "text-[#3f5146] hover:bg-muted",
                        )}
                      >
                        <Icon className={cn("h-4.5 w-4.5", active ? "text-canopy" : "text-sage")} aria-hidden="true" />
                        {item.label}
                        {active ? (
                          <span className="ml-auto h-2 w-2 rounded-full bg-sun" aria-hidden="true" />
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-border pt-3">
                  <InstallAppButton variant="outline" className="w-full justify-start" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="border-t border-border/60 bg-card/55 px-4 py-1.5 sm:hidden">
        <LocationPicker />
      </div>
    </header>
  );
}
