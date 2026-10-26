import Link from "next/link";
import { ExternalLink, HeartPulse, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Data sources & methodology" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/preparedness", label: "Preparedness" },
  { href: "/alerts", label: "Alerts" },
  { href: "/admin/login", label: "Administrator sign in" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-navy text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Brand onDark />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Heat awareness and community preparedness for Central Luzon. Understand the heat. Find relief. Stay
            prepared.
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
            <p>
              SILONG PH is an independent public-service project. It is not affiliated with, endorsed by, or an
              official channel of DOST-PAGASA, the Department of Health, or any local government unit.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerLinks.slice(0, 5).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Official sources</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href="https://www.pagasa.dost.gov.ph/weather/heat-index"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                PAGASA heat index <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://caro.doh.gov.ph/heat-related-illnesses/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                DOH heat-related illness <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://ndrrmc.gov.ph/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                NDRRMC <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          </ul>
          <div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
            <p>
              For suspected heat stroke, call 911 or local emergency services immediately. This site is not medical
              advice.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} SILONG PH. Weather data by Open-Meteo. Boundaries and PSGC codes from PSA and
          faeldon/philippines-json-maps. Map tiles © OpenStreetMap contributors.
        </p>
      </div>
    </footer>
  );
}
