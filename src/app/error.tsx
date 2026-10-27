"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { LocationProvider } from "@/components/location/location-provider";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SilongMark } from "@/components/silong-mark";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <LocationProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader />
        <main id="main-content" className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <SilongMark className="mx-auto h-14 w-14" />
            <p className="eyebrow mt-6 text-sun-ink">May problema</p>
            <h1 className="mt-2 text-balance font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.05em] text-forest">
              Hindi ma-load ang page na ito
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Naitala na ang problema. Walang gawa-gawang data na ipinalit sa content na hindi nag-load.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={reset}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Subukan muli
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Bumalik sa home</Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
        <MobileBottomNav />
      </div>
    </LocationProvider>
  );
}
