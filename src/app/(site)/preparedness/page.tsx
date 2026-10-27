import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Phone,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { PageMasthead, SectionHeading } from "@/components/layout/page-masthead";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEDICAL_DISCLAIMER, preparednessSections, preparednessSources } from "@/data/preparedness";

export const metadata: Metadata = {
  title: "Ano ang dapat gawin kapag mainit?",
  description:
    "Simpleng gabay bago, habang, at pagkatapos ng matinding init sa Central Luzon, pati sintomas ng heat illness at opisyal na sources.",
};

const quickGuide = [
  {
    title: "Uminom ng tubig bago ka mauhaw",
    body: "Uminom nang regular. Sundin ang payo ng doktor kung may limitasyon ka sa fluids.",
  },
  {
    title: "Magpahinga sa lilim o malamig na lugar",
    body: "Gumamit ng bentilasyon, fan, aircon, o beripikadong cooling place. Huwag hintayin sumama ang pakiramdam.",
  },
  {
    title: "Iwasan ang mabigat na gawain sa pinakamainit na oras",
    body: "Ilayo ang trabaho at exercise sa labas sa late morning hanggang hapon kung kaya.",
  },
  {
    title: "Tumawag agad ng 911 kapag emergency",
    body: "Pagkalito, pagkawala ng malay, seizures, o pagbagsak: huwag ipagpaliban ang tulong.",
  },
];

function SectionCard({
  section,
  index,
  defaultOpen = false,
}: {
  section: (typeof preparednessSections)[number];
  index: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[var(--shadow-soft)] open:border-sage/70"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-4 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="whitespace-nowrap font-display text-2xl font-bold tracking-[-0.05em] text-[#6f8a7b] sm:text-3xl">{index}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-sun-ink">
            {section.taglishTitle}
          </span>
          <span className="mt-1 block font-display text-lg font-bold leading-snug tracking-[-0.025em] text-forest sm:text-xl">
            {section.title}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {section.items.length} hakbang
          </Badge>
          <ChevronDown
            className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
      </summary>
      <div className="border-t border-border/70 px-4 py-5 sm:px-6">
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{section.summary}</p>
        <div className="mt-4 grid gap-x-8 gap-y-0 md:grid-cols-2">
          {section.items.map((item) => (
            <div key={item.title} className="border-t border-border/60 py-4 first:border-t-0 md:first:border-t-0">
              <h3 className="font-display text-[15px] font-bold leading-snug text-forest">{item.title}</h3>
              <p className="mt-1 text-sm leading-7 text-[#536258]">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function PreparednessPage() {
  const during = preparednessSections.find((section) => section.id === "during");
  const illness = preparednessSections.find((section) => section.id === "illness");
  const before = preparednessSections.find((section) => section.id === "before");
  const after = preparednessSections.find((section) => section.id === "after");

  return (
    <div>
      <PageMasthead
        eyebrow="Paghahanda sa init"
        title="Ano ang dapat gawin kapag mainit?"
        description="Simpleng gabay para sa pamilya, trabaho, paaralan, at komunidad sa Central Luzon. Pangkalahatang heat-safety education ito, hindi medical advice o opisyal na abiso."
        actions={
          <>
            <Badge variant="warning" className="bg-white/10 text-white">
              <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Bago · Habang · Pagkatapos
            </Badge>
            <Badge variant="outline" className="border-white/25 bg-white/5 text-white">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Taglish na gabay
            </Badge>
          </>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="relative overflow-hidden rounded-[1.7rem] border border-[#dfb1ac] bg-[#fbeceb] p-5 sm:p-6">
            <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-danger" />
            <div className="flex gap-4 pl-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3d8d5] text-danger">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8f1f18]">
                  Emergency · huwag ipagpaliban
                </p>
                <h2 className="mt-1 font-display text-xl font-bold leading-snug text-[#3f1210]">
                  Emergency ang pinaghihinalaang heat stroke
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6b2d28]">
                  Tumawag agad sa <strong>911</strong> o lokal na emergency service kung may pagkalito, hindi malinaw
                  na pagsasalita, seizures, pagkawala ng malay, pagbagsak, o sobrang taas na body temperature. Simulan
                  ang pagpapalamig habang naghihintay ng tulong. Huwag bigyan ng fluids ang taong nalilito o walang
                  malay.
                </p>
              </div>
            </div>
          </div>

          <div className="paper-panel rounded-[1.7rem] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
              <Phone className="h-4 w-4 text-canopy" aria-hidden="true" /> Mga emergency contact
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#3f5146]">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                National emergency hotline: <strong className="font-bold text-forest">911</strong>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Local DRRMO o city/municipal hall
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                Pinakamalapit na ospital o health center
              </li>
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Hindi nagpapadala ng emergency services ang SILONG PH at hindi nito makukumpirma ang lokal na hotline
              numbers.
            </p>
          </div>
        </div>

        <section className="mt-12" aria-labelledby="quick-guide-heading">
          <SectionHeading
            eyebrow="Mabilis na sagot"
            id="quick-guide-heading"
            title="Apat na dapat tandaan"
            description="Kung wala nang panahong basahin ang buong gabay, ito muna ang pinakamahalaga."
          />
          <div className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2">
            {quickGuide.map((item, index) => (
              <div key={item.title} className="flex gap-4 border-t border-border py-5 first:border-t-0 sm:first:border-t">
                <span className="shrink-0 whitespace-nowrap font-display text-3xl font-bold tracking-[-0.06em] text-sun-ink/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold leading-snug tracking-[-0.025em] text-forest">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-[#536258]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="full-guide-heading">
          <SectionHeading
            eyebrow="Buong gabay"
            id="full-guide-heading"
            title="Bago, habang, at pagkatapos ng init"
            description="Pindutin ang isang bahagi para buksan ang mga hakbang. Bukas na agad ang pinakamahalaga habang mainit."
          />
          <div className="mt-5 space-y-3">
            {during ? <SectionCard section={during} index="01" defaultOpen /> : null}
            {illness ? <SectionCard section={illness} index="02" defaultOpen /> : null}
            {before ? <SectionCard section={before} index="03" /> : null}
            {after ? <SectionCard section={after} index="04" /> : null}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="sources-heading">
          <SectionHeading
            eyebrow="Mga source at link"
            id="sources-heading"
            title="Opisyal na sources"
            description="Naka-link ang SILONG PH sa mga source na ito; hindi nito awtomatikong nire-republish ang kanilang abiso."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/alerts">Tingnan ang opisyal na babala</Link>
              </Button>
            }
          />
          <div className="mt-5 grid gap-x-8 md:grid-cols-2">
            {preparednessSources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-24 items-start justify-between gap-4 border-t border-border py-4 transition-colors hover:text-primary"
              >
                <div>
                  <p className="font-display text-[15px] font-bold leading-snug text-forest group-hover:text-primary">
                    {source.title}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-sun-ink">{source.publisher}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{source.note}</p>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-sage group-hover:text-primary" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Alert variant="warning" title="Paalala tungkol sa kalusugan">
            {MEDICAL_DISCLAIMER}
          </Alert>
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[#e5eee3] p-5 sm:p-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
            <div className="relative">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
                <ShieldCheck className="h-4 w-4 text-canopy" aria-hidden="true" /> Gumawa ng personal na plano
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[#3f5146]">
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                  Alamin ang preskong lugar na kaya mong puntahan at i-confirm kung bukas ito.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                  Ihanda ang tubig, gamot, at phone charger.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                  Magkasundo sa check-in plan para sa matatanda, kapitbahay na mag-isa, at may disability.
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold">
                <Link href="/cool-places" className="inline-flex min-h-11 max-w-full items-center gap-1 text-primary">
                  Humanap ng preskong lugar <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link href="/map" className="inline-flex min-h-11 max-w-full items-center gap-1 text-primary">
                  Tingnan ang mapa ng init
                </Link>
                <Link href="/methodology" className="inline-flex min-h-11 max-w-full items-center gap-1 text-primary">
                  Paano namin kinukuha ang datos
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-2 rounded-2xl border border-border/80 bg-[#f8f3e9] p-4 text-xs leading-relaxed text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sun-ink" aria-hidden="true" />
          <p>
            Nagbabago ang heat guidance ayon sa lokal na kondisyon at opisyal na direktiba. Sundin ang pinakabagong
            instruksyon ng PAGASA, DOH, LGU, at ng trabaho o paaralan mo. Kung may conflict sa official emergency
            instruction, sundin ang official instruction.
          </p>
        </div>
      </div>
    </div>
  );
}
