import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, HeartHandshake, Map, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageMasthead } from "@/components/layout/page-masthead";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { geographyProvenance, provinces, region } from "@/lib/geography";

export const metadata: Metadata = {
  title: "Tungkol sa proyekto",
  description:
    "Bakit may SILONG PH, ano ang ginagawa at hindi ginagawa nito, paano bine-verify ang impormasyon, at sino ang nagpapatakbo ng proyekto.",
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function AboutPage() {
  return (
    <div>
      <PageMasthead
        eyebrow="Tungkol"
        title="Alamin ang init. Humanap ng silong. Maging handa."
        description={`Independenteng public-service web app ang SILONG PH para sa ${region.name} (${region.shortName}). Pinagsasama nito ang model weather, malinaw na label na estimated heat index, mapa, directory ng pampublikong pasilidad na may verification status, at praktikal na gabay sa paghahanda.`}
        actions={
          <>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              Central Luzon
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              {provinces.length} probinsya
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              130 lungsod at munisipyo
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              PWA · mobile first
            </Badge>
          </>
        }
      />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="paper-panel rounded-[1.7rem] p-5 sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7efe8] text-[#24563c]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-forest">Ano ang ginagawa nito</h2>
            <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[#3f5146]">
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Ipinapakita ang kasalukuyang Open-Meteo model conditions at 7-day forecast sa napiling lugar o province
                point.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Kinukuwenta ang estimated heat index at inuuri gamit ang official PAGASA categories.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Naglilista ng pampublikong pasilidad na may malinaw na verification status, source, at review dates.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Nagbibigay ng edukasyon sa paghahanda, official-source links, at moderated correction process.
              </li>
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[1.7rem] border border-[#e4c792] bg-[#fbf1dc] p-5 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-70" />
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e2bd] text-[#8a4b00]">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-forest">
                Ano ang hindi nito ginagawa
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[#5d3a08]">
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b37b28]" aria-hidden="true" />
                  Hindi nito sinasabing official PAGASA reading ang heat index na kinuwenta ng app.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b37b28]" aria-hidden="true" />
                  Hindi ito gumagawa ng live readings, advisories, cooling centers, o contact details.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b37b28]" aria-hidden="true" />
                  Hindi ito kapalit ng emergency services, medical advice, o official LGU instructions.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b37b28]" aria-hidden="true" />
                  Hindi nito ginagarantiyang bukas, malamig, accessible, o ligtas ang isang hindi pa beripikadong
                  pasilidad.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <section className="prose-silong mt-10" aria-labelledby="independence-heading">
          <h2 id="independence-heading">Independence at affiliation</h2>
          <p>
            Hindi kaakibat, inendorso, o official channel ng DOST-PAGASA, Department of Health, NDRRMC, o ng anumang
            lokal na pamahalaan ang SILONG PH. Naka-link ito sa official sources at malinaw na nilalagyan ng label ang
            impormasyong ini-record ng admin. Kung may conflict sa official instruction, sundin ang official instruction.
          </p>

          <h2>Paano hinahawakan ang impormasyon</h2>
          <p>
            Galing sa Open-Meteo model data ang weather at forecast. Kinukuwenta ng app na ito ang heat index gamit ang
            US National Weather Service regression na may documented adjustments. Official PAGASA categories ang
            ginagamit sa pag-uuri, pero hindi official PAGASA observation ang value mismo.
          </p>
          <p>
            Ang cooling-place records ay galing sa OpenStreetMap bilang{" "}
            <strong>hindi pa beripikadong pampublikong pasilidad</strong> o ginawa ng admin. Beripikado lang ang record
            pagkatapos suriin ng awtorisadong reviewer ang detalye, public access, at pagiging angkop bilang cooling
            place. Hindi real-time occupancy guarantee ang verification.
          </p>
          <p>
            Iniimbak lang ang official advisories kapag may naitalang named issuer, issue time, affected area, at
            mapapatunayang source URL ang admin. Hindi awtomatikong kumukuha ng PAGASA o LGU advisories ang app. Ang
            walang laman na advisory list ay ibig sabihin walang naitala rito, hindi walang advisory sa labas.
          </p>

          <h2>Sakop at heograpiya</h2>
          <p>
            Sakop ng app ang pitong probinsya ng {region.name}: Aurora, Bataan, Bulacan, Nueva Ecija, Pampanga, Tarlac,
            at Zambales, kasama ang 130 lungsod at munisipyo. Kasama ang Angeles City at Olongapo City bilang independent
            cities para sa regional coverage. Wala ang geometry nila sa source boundary files, kaya geocoded
            representative points ang gamit.
          </p>
          <p className="text-sm text-muted-foreground">
            Pinagmulan ng geography: {geographyProvenance.names} {geographyProvenance.boundaries}{" "}
            <a href={geographyProvenance.boundaryUrl} target="_blank" rel="noreferrer">
              Boundary source <ExternalLink className="inline h-3.5 w-3.5" aria-hidden="true" />
            </a>
            .
          </p>

          <h2>Accessibility</h2>
          <p>
            Target ng interface ang WCAG 2.2 AA: keyboard-operable controls, visible focus, semantic headings, text
            alternatives para sa maps at charts, reduced-motion support, at mobile-first layouts. May searchable text
            alternative ang maps. Kung may hadlang na makita, i-report sa correction process o sa operator contact sa
            ibaba.
          </p>

          <h2>Mga correction at input ng komunidad</h2>
          <p>
            May report form ang bawat facility page para sa maling detalye, lumang oras, pagsasara, accessibility
            information, at bagong lokasyon. Napupunta sa moderation queue ang reports at hindi awtomatikong
            napi-publish. Hindi kailangan ng account para magpadala ng report, at huwag maglagay ng personal na
            impormasyon ng ibang tao.
          </p>

          <h2>Operator at contact</h2>
          <p>
            {contactEmail ? (
              <>
                Ang deployment na ito ay pinapatakbo ng maintainer nito. Contact:{" "}
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Para sa lokal na emergency, tumawag sa 911 o sa
                lokal na DRRMO — hindi sa proyektong ito.
              </>
            ) : (
              <>
                Walang naka-configure na public operator contact address para sa deployment na ito. Gamitin ang report
                form sa facility page para sa data corrections. Para sa lokal na emergency, tumawag sa 911 o sa lokal
                na DRRMO — hindi sa proyektong ito.
              </>
            )}
          </p>
        </section>

        <Alert variant="warning" className="mt-8" title="Emergency at medical disclaimer">
          Pangkalahatang heat-safety education ang SILONG PH, hindi medical advice o diagnosis. Kung pinaghihinalaang
          heat stroke o may emergency na delikado sa buhay, tumawag agad sa 911 o lokal na emergency service. Huwag
          ipagpaliban ang emergency care para gamitin ang app na ito.
        </Alert>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/methodology">Paano namin kinukuha ang datos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/privacy">Patakaran sa privacy</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/preparedness">Paghahanda sa init</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border-t border-border pt-4">
            <Users className="h-5 w-5 text-canopy" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold text-forest">Para sa residente</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Tingnan ang kondisyon, iplano ang gawain sa paligid ng pinakamainit na oras, at alamin kung saan ligtas
              na makakapagpalamig.
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <Map className="h-5 w-5 text-canopy" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold text-forest">Para sa planner</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Gamitin ang province at locality pages para makita ang model points at facility coverage. Huwag ituring
              na barangay-level measurements.
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <HeartHandshake className="h-5 w-5 text-canopy" aria-hidden="true" />
            <h2 className="mt-2 font-display text-base font-bold text-forest">Para sa komunidad</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              I-report ang maling impormasyon ng pasilidad para masuri ng reviewer, at official source ang i-share,
              hindi screenshot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
