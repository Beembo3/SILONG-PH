import Link from "next/link";
import { ExternalLink, HeartPulse, ShieldCheck, Sun } from "lucide-react";
import { Brand } from "@/components/brand";
import { InstallAppButton } from "@/components/pwa/install-app";

const footerLinks = [
  { href: "/about", label: "Tungkol sa SILONG PH" },
  { href: "/methodology", label: "Saan galing ang datos" },
  { href: "/privacy", label: "Patakaran sa privacy" },
  { href: "/preparedness", label: "Paghahanda sa init" },
  { href: "/alerts", label: "Mga babala" },
  { href: "/admin/login", label: "Mag-sign in bilang admin" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-forest pb-[calc(5rem+env(safe-area-inset-bottom))] text-[#d7e3d8] sm:mt-20 lg:pb-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines opacity-80" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[2.8rem] border-white/[0.035]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-10 h-24 w-24 rounded-full bg-sun/15 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 py-12 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
          <div>
            <Brand onDark />
            <p className="mt-5 max-w-md text-sm leading-7 text-[#b9cbbd]">
              Kaligtasan sa init at paghahanda ng komunidad para sa Central Luzon. Alamin ang init. Humanap ng silong.
              Maging handa.
            </p>
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-xs leading-relaxed text-[#c8d7ca]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
              <p className="min-w-0 break-words">
                Independenteng public-service project ang SILONG PH. Hindi ito kaakibat, inendorso, o opisyal na
                channel ng DOST-PAGASA, Department of Health, o ng anumang lokal na pamahalaan.
              </p>
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-[#9db6a2]">Tuklasin</h2>
            <ul className="mt-4 space-y-1 text-sm">
              {footerLinks.slice(0, 5).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-[#d7e3d8] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-white/10 pt-3">
              <InstallAppButton
                variant="ghost"
                className="h-auto min-h-11 px-0 text-sm font-bold text-[#d7e3d8] hover:bg-transparent hover:text-white"
              />
            </div>
          </div>

          <div>
            <h2 className="eyebrow text-[#9db6a2]">Opisyal na pinagmulan</h2>
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <a
                  href="https://www.pagasa.dost.gov.ph/weather/heat-index"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-[#d7e3d8] transition-colors hover:text-white"
                >
                  Heat index ng PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://caro.doh.gov.ph/heat-related-illnesses/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-[#d7e3d8] transition-colors hover:text-white"
                >
                  Sakit na dulot ng init – DOH <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://ndrrmc.gov.ph/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 text-[#d7e3d8] transition-colors hover:text-white"
                >
                  NDRRMC <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#0d2f25] p-4 text-xs leading-relaxed text-[#c8d7ca]">
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-[#f19a7e]" aria-hidden="true" />
              <p>
                Kung pinaghihinalaang heat stroke, tumawag agad sa 911 o lokal na emergency service. Hindi ito medical
                advice.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 text-xs leading-relaxed text-[#9db6a2] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl">
            © {new Date().getFullYear()} SILONG PH. Weather data mula sa Open-Meteo. Boundaries at PSGC codes mula sa PSA
            at faeldon/philippines-json-maps. Map tiles © OpenStreetMap contributors.
          </p>
          <Link
            href="/admin/login"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-[#c8d7ca] transition-colors hover:text-white"
          >
            <Sun className="h-4 w-4 text-sun" aria-hidden="true" />
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
