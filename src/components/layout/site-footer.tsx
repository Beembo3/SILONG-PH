import Link from "next/link";
import { ExternalLink, HeartPulse, ShieldCheck } from "lucide-react";
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
    <footer className="mt-10 border-t border-slate-800 bg-navy pb-[calc(4rem+env(safe-area-inset-bottom))] text-slate-300 sm:mt-16 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Brand onDark />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Kaligtasan sa init at paghahanda ng komunidad para sa Central Luzon. Alamin ang init. Humanap ng silong.
            Maging handa.
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
            <p className="min-w-0 break-words">
              Independenteng public-service project ang SILONG PH. Hindi ito kaakibat, inendorso, o opisyal na channel
              ng DOST-PAGASA, Department of Health, o ng anumang lokal na pamahalaan.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Tuklasin</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerLinks.slice(0, 5).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-white/10 pt-4">
            <InstallAppButton
              variant="ghost"
              className="h-auto min-h-11 px-0 text-sm font-medium text-slate-300 hover:bg-transparent hover:text-white"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Opisyal na pinagmulan</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href="https://www.pagasa.dost.gov.ph/weather/heat-index"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 hover:text-white"
              >
                Heat index ng PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://caro.doh.gov.ph/heat-related-illnesses/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 hover:text-white"
              >
                Sakit na dulot ng init – DOH <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://ndrrmc.gov.ph/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 hover:text-white"
              >
                NDRRMC <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          </ul>
          <div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
            <p>
              Kung pinaghihinalaang heat stroke, tumawag agad sa 911 o lokal na emergency service. Hindi ito medical
              advice.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} SILONG PH. Weather data mula sa Open-Meteo. Boundaries at PSGC codes mula sa PSA
          at faeldon/philippines-json-maps. Map tiles © OpenStreetMap contributors.
        </p>
      </div>
    </footer>
  );
}
