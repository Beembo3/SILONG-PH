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
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function SectionCard({ section, defaultOpen = false }: { section: (typeof preparednessSections)[number]; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-white open:shadow-sm"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {section.taglishTitle}
          </span>
          <span className="mt-0.5 block text-lg font-extrabold leading-snug text-navy">{section.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <Badge variant="outline">{section.items.length} hakbang</Badge>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-border px-4 py-4 sm:px-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {section.items.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-bold text-navy">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.detail}</p>
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
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Paghahanda sa init</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Ano ang dapat gawin kapag mainit?
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Simpleng gabay para sa pamilya, trabaho, paaralan, at komunidad sa Central Luzon. Pangkalahatang
          heat-safety education ito, hindi medical advice o opisyal na abiso.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="orange">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Bago · Habang · Pagkatapos
          </Badge>
          <Badge variant="outline">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Taglish na gabay
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Alert variant="danger" title="Emergency ang pinaghihinalaang heat stroke">
          <p>
            Tumawag agad sa <strong>911</strong> o lokal na emergency service kung may pagkalito, hindi malinaw na
            pagsasalita, seizures, pagkawala ng malay, pagbagsak, o sobrang taas na body temperature. Simulan ang
            pagpapalamig habang naghihintay ng tulong. Huwag bigyan ng fluids ang taong nalilito o walang malay.
          </p>
        </Alert>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" /> Mga emergency contact
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
              <li>National emergency hotline: 911</li>
              <li>Local DRRMO o city/municipal hall</li>
              <li>Pinakamalapit na ospital o health center</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Hindi nagpapadala ng emergency services ang SILONG PH at hindi nito makukumpirma ang lokal na hotline
              numbers.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8" aria-labelledby="quick-guide-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mabilis na sagot</p>
          <h2 id="quick-guide-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            Apat na dapat tandaan
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickGuide.map((item, index) => (
            <Card key={item.title} className="h-full">
              <CardContent className="p-4">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-sm font-extrabold text-orange-800">
                  {index + 1}
                </span>
                <h3 className="mt-2 text-sm font-extrabold leading-snug text-navy">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-3">
        {during ? <SectionCard section={during} defaultOpen /> : null}
        {illness ? <SectionCard section={illness} defaultOpen /> : null}
        {before ? <SectionCard section={before} /> : null}
        {after ? <SectionCard section={after} /> : null}
      </div>

      <section className="mt-10" aria-labelledby="sources-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mga source at link</p>
            <h2 id="sources-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Opisyal na sources
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Naka-link ang SILONG PH sa mga source na ito; hindi nito awtomatikong nire-republish ang kanilang abiso.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/alerts">Tingnan ang opisyal na babala</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {preparednessSources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-orange-300"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-bold text-navy">
                {source.title}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-primary" aria-hidden="true" />
              </p>
              <p className="mt-0.5 text-xs font-semibold text-primary">{source.publisher}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{source.note}</p>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Alert variant="warning" title="Paalala tungkol sa kalusugan">
          {MEDICAL_DISCLAIMER}
        </Alert>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Gumawa ng personal na plano
            </h2>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Alamin ang preskong lugar na kaya mong puntahan at i-confirm kung bukas ito.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Ihanda ang tubig, gamot, at phone charger.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Magkasundo sa check-in plan para sa matatanda, kapitbahay na mag-isa, at may disability.
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <Link href="/cool-places" className="inline-flex min-h-11 items-center gap-1 text-primary">
                Humanap ng preskong lugar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/map" className="inline-flex min-h-11 items-center gap-1 text-primary">
                Tingnan ang mapa ng init
              </Link>
              <Link href="/methodology" className="inline-flex min-h-11 items-center gap-1 text-primary">
                Paano namin kinukuha ang datos
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Nagbabago ang heat guidance ayon sa lokal na kondisyon at opisyal na direktiba. Sundin ang pinakabagong
          instruksyon ng PAGASA, DOH, LGU, at ng trabaho o paaralan mo. Kung may conflict sa official emergency
          instruction, sundin ang official instruction.
        </p>
      </div>
    </div>
  );
}
