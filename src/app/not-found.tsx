import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { LocationProvider } from "@/components/location/location-provider";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SilongMark } from "@/components/silong-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <LocationProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-14 lg:px-8">
            <div>
              <SilongMark className="h-14 w-14" />
              <p className="eyebrow mt-6 text-sun-ink">404 · Wala ang page</p>
              <h1 className="mt-2 text-balance font-display text-[clamp(2.4rem,6vw,4.2rem)] font-bold leading-[0.96] tracking-[-0.05em] text-forest">
                Wala ang page na ito
              </h1>
              <p className="mt-4 max-w-lg text-pretty text-[15px] leading-7 text-muted-foreground">
                Wala ang page o record na hinahanap mo. Maaaring nailipat o na-archive na ito. Hindi kami nagpapakita ng
                gawa-gawang data kapag wala ang tunay na record.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/">Bumalik sa home</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cool-places">Humanap ng preskong lugar</Link>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.8rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-70" />
              <div className="relative">
                <p className="eyebrow text-sun-ink">
                  <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Simulan muli
                </p>
                <h2 className="mt-3 font-display text-xl font-bold tracking-[-0.03em] text-forest">
                  Mga madaling puntahan
                </h2>
                <div className="mt-3 divide-y divide-border/70">
                  {[
                    { href: "/map", label: "Mapa ng init", detail: "Tingnan ang model estimate sa rehiyon" },
                    { href: "/alerts", label: "Mga babala", detail: "Official advisory at heat notice" },
                    { href: "/preparedness", label: "Paghahanda", detail: "Mga dapat gawin bago at habang mainit" },
                    { href: "/about", label: "Tungkol", detail: "Ano ang SILONG PH at paano ito gumagana" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex min-h-14 items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary"
                    >
                      <span>
                        <span className="flex items-center gap-1.5 font-bold text-forest">
                          <MapPin className="h-3.5 w-3.5 text-canopy" aria-hidden="true" />
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.detail}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
        <MobileBottomNav />
      </div>
    </LocationProvider>
  );
}
