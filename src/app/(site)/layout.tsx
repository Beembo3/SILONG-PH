import { LocationProvider } from "@/components/location/location-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { OfflineBanner } from "@/components/pwa/offline-banner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <OfflineBanner />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav />
      </div>
    </LocationProvider>
  );
}
