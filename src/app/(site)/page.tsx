import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Droplets,
  ExternalLink,
  HeartPulse,
  Info,
  MapPin,
  ShieldCheck,
  Siren,
  Sun,
} from "lucide-react";
import { CanopyScene } from "@/components/home/canopy-scene";
import { HomeWeatherSummary } from "@/components/home/home-weather-summary";
import { SectionHeading } from "@/components/layout/page-masthead";
import { RegionOverview } from "@/components/weather/region-overview";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alertSeverityLabel, alertSeverityVariant } from "@/lib/alerts";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ngayon sa Central Luzon",
  description:
    "Alamin ang estimated heat index sa lugar mo, opisyal na babala, preskong lugar, at mga simpleng hakbang para manatiling ligtas sa init.",
};

const primaryActions = [
  {
    href: "/alerts",
    icon: Siren,
    number: "01",
    title: "Tingnan ang mga babala",
    body: "Opisyal na abiso at heat notice ng app, may source at oras.",
    cta: "Buksan ang mga babala",
    className: "bg-forest text-primary-foreground hover:bg-navy",
    iconClass: "bg-sun text-forest",
    bodyClass: "text-[#c8d7ca]",
    ctaClass: "text-sun",
    numberClass: "before:text-white/15",
  },
  {
    href: "/cool-places",
    icon: MapPin,
    number: "02",
    title: "Hanapin ang malamig na lugar",
    body: "Mall, aklatan, parke, at iba pang pampublikong lugar, may label kung beripikado.",
    cta: "Hanapin ang lugar",
    className: "bg-sun text-[#2b1b04] hover:bg-[#f6c46d]",
    iconClass: "bg-forest text-sun",
    bodyClass: "text-[#5c410f]",
    ctaClass: "text-forest",
    numberClass: "before:text-[#2b1b04]/15",
  },
  {
    href: "/preparedness",
    icon: BookOpen,
    number: "03",
    title: "Alamin ang dapat gawin",
    body: "Simpleng gabay bago at habang mainit, pati sintomas na dapat abangan.",
    cta: "Basahin ang gabay",
    className: "bg-[#e5eee3] text-forest hover:bg-[#dce8d9]",
    iconClass: "bg-card text-forest",
    bodyClass: "text-[#4e6154]",
    ctaClass: "text-forest",
    numberClass: "before:text-forest/10",
  },
];

export default async function HomePage() {
  const now = new Date();
  let latestAlert: {
    id: string;
    title: string;
    affectedArea: string;
    severity: string;
    issuer: string;
    issuedAt: Date;
    expiresAt: Date | null;
    sourceUrl: string;
  } | null = null;
  let alertsUnavailable = false;

  try {
    latestAlert = await prisma.officialAlert.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ issuedAt: "desc" }],
      select: {
        id: true,
        title: true,
        affectedArea: true,
        severity: true,
        issuer: true,
        issuedAt: true,
        expiresAt: true,
        sourceUrl: true,
      },
    });
  } catch {
    alertsUnavailable = true;
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-7 sm:gap-8 sm:px-6 sm:pb-20 sm:pt-12 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-10 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="min-w-0 max-w-2xl">
            <p className="eyebrow text-sun-ink">
              <span className="flex h-2 w-2 rounded-full bg-sun" aria-hidden="true" />
              SILONG PH · Central Luzon
            </p>
            <h1 className="mt-4 text-balance font-display text-[clamp(2.55rem,6.3vw,5.25rem)] font-bold leading-[0.92] tracking-[-0.055em] text-forest [overflow-wrap:anywhere]">
              Sa init ng panahon, may{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.08em] bottom-[0.08em] h-[0.3em] rounded-full bg-sun/65"
                />
                <span className="relative">silong</span>
              </span>{" "}
              kang maaasahan.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[16px] leading-8 text-[#4b5e51] sm:text-lg">
              Isang malinaw na lugar para tingnan ang lagay ng init, makahanap ng preskong matatagpuan, at malaman ang
              simpleng gagawin para manatiling ligtas.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Button asChild size="lg">
                <a href="#weather">
                  Tingnan ang lagay ng init <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cool-places">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> Humanap ng silong
                </Link>
              </Button>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-[#5c6b61]">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Model weather, may source
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Siren className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Opisyal na abiso
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Beripikadong lugar
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem] lg:max-w-none">
            <CanopyScene className="h-52 drop-shadow-[0_24px_38px_rgba(18,59,46,0.12)] sm:h-64 lg:h-auto" />
            <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold text-[#64736a]">
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              <span>
                <strong className="font-display text-sm font-bold text-forest">silong</strong> · lilim o kanlungan
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div id="weather" className="scroll-mt-28 -mt-10 sm:-mt-16">
          <HomeWeatherSummary />
        </div>

        <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-20">
          <section aria-labelledby="official-alert-heading">
            <SectionHeading
              eyebrow="Opisyal"
              id="official-alert-heading"
              title="May aktibong babala ba?"
              description="Dito lang lumalabas ang mga opisyal na abisong naka-record sa SILONG PH. May source at oras ang bawat isa."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/alerts">
                    Lahat ng babala <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              }
            />

            {alertsUnavailable ? (
              <Alert variant="warning" className="mt-5" title="Hindi makuha ang official alerts ngayon">
                Hindi maabot ang alert records sa ngayon. Huwag ipagpalagay na walang babala. Tingnan ang{" "}
                <a
                  href="https://www.pagasa.dost.gov.ph/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline"
                >
                  DOST-PAGASA
                </a>{" "}
                at ang inyong LGU.
              </Alert>
            ) : latestAlert ? (
              <div className="mt-5 overflow-hidden rounded-[1.6rem] bg-forest text-primary-foreground shadow-[var(--shadow-lift)]">
                <div className="grid sm:grid-cols-[8.5rem_1fr]">
                  <div className="flex items-center gap-2 border-b border-white/10 bg-sun px-5 py-3 text-forest sm:flex-col sm:items-start sm:justify-center sm:border-b-0 sm:px-5 sm:py-6">
                    <Siren className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.15em]">Opisyal na abiso</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={alertSeverityVariant(latestAlert.severity)}>
                        {alertSeverityLabel(latestAlert.severity)}
                      </Badge>
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b9cbbd]">
                        Aktibo ngayon
                      </span>
                    </div>
                    <h3 className="mt-3 max-w-3xl font-display text-xl font-bold leading-snug tracking-[-0.03em] sm:text-2xl">
                      {latestAlert.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#c8d7ca]">
                      Para sa <strong className="font-bold text-white">{latestAlert.affectedArea}</strong> · mula kay{" "}
                      {latestAlert.issuer}
                    </p>
                    <p className="mt-1 text-xs text-[#9db6a2]">
                      Inilabas {formatPST(latestAlert.issuedAt)}
                      {latestAlert.expiresAt ? ` · hanggang ${formatPST(latestAlert.expiresAt)}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="accent">
                        <Link href="/alerts">Basahin ang detalye</Link>
                      </Button>
                      <Button asChild size="sm" variant="inverse">
                        <a href={latestAlert.sourceUrl} target="_blank" rel="noreferrer">
                          Opisyal na source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 flex gap-4 rounded-[1.6rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8efe5] text-canopy">
                  <Info className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold leading-snug text-forest">
                    Walang naka-record na aktibong opisyal na babala sa SILONG PH ngayon
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-7 text-muted-foreground">
                    Hindi ito nangangahulugang walang babala sa labas. I-check pa rin ang DOST-PAGASA at ang inyong LGU,
                    lalo na kung mataas ang heat index sa lugar mo.
                  </p>
                  <Link href="/alerts" className="link-arrow mt-3 min-h-11 text-sm text-primary">
                    Tingnan ang lahat ng abiso <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="primary-actions-heading">
            <SectionHeading
              eyebrow="Ano ang susunod?"
              id="primary-actions-heading"
              title="Pumili ng gusto mong gawin"
              description="Tatlong malinaw na daan depende sa kailangan mo ngayon."
            />
            <div className="mt-6 grid gap-3.5 md:grid-cols-3">
              {primaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    data-number={action.number}
                    className={cn(
                      "group relative flex min-h-[15rem] flex-col overflow-hidden rounded-[1.65rem] p-5 transition-[background-color,transform] duration-200 before:pointer-events-none before:absolute before:-right-2 before:-top-7 before:font-display before:text-[8rem] before:font-bold before:leading-none before:tracking-[-0.08em] before:content-[attr(data-number)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-6",
                      action.className,
                      action.numberClass,
                    )}
                  >
                    <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", action.iconClass)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 max-w-[13rem] font-display text-[1.45rem] font-bold leading-[1.02] tracking-[-0.04em]">
                      {action.title}
                    </h3>
                    <p className={cn("mt-2.5 flex-1 text-sm leading-6", action.bodyClass)}>{action.body}</p>
                    <span className={cn("mt-5 inline-flex items-center gap-1.5 text-sm font-bold", action.ctaClass)}>
                      {action.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="safety-tip-heading">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#e5eee3] px-5 py-7 sm:px-8 sm:py-9">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="max-w-2xl">
                  <p className="eyebrow text-canopy">
                    <span className="h-px w-5 bg-canopy" aria-hidden="true" /> Isang payo ngayon
                  </p>
                  <h2
                    id="safety-tip-heading"
                    className="mt-3 text-balance font-display text-[clamp(1.85rem,4vw,3rem)] font-bold leading-[0.98] tracking-[-0.05em] text-forest"
                  >
                    Uminom ng tubig bago ka mauhaw.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#4e6154] sm:text-[15px]">
                    Magpahinga sa lilim o malamig na lugar tuwing mainit. Kung may sakit sa puso o kidney, sundin ang
                    payo ng doktor tungkol sa dami ng iniinom na tubig.
                  </p>
                  <Link href="/preparedness" className="link-arrow mt-4 min-h-11 text-sm text-primary">
                    Buong gabay sa paghahanda <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="relative mx-auto flex h-32 w-32 shrink-0 items-center justify-center rounded-full border border-canopy/15 bg-card/60 sm:h-40 sm:w-40">
                  <div aria-hidden="true" className="absolute inset-4 rounded-full border border-canopy/10" />
                  <Droplets className="h-14 w-14 text-canopy sm:h-16 sm:w-16" aria-hidden="true" />
                </div>
              </div>
            </div>
          </section>

          <RegionOverview compact />

          <section aria-labelledby="trust-heading" className="relative overflow-hidden rounded-[2rem] bg-forest px-5 py-8 text-primary-foreground sm:px-8 sm:py-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines opacity-80" />
            <div className="relative grid gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
              <div>
                <p className="eyebrow text-sun">Paano ka namin pinoprotektahan</p>
                <h2
                  id="trust-heading"
                  className="mt-3 max-w-xl text-balance font-display text-[clamp(1.8rem,3.8vw,2.8rem)] font-bold leading-[1] tracking-[-0.045em]"
                >
                  Malinaw ang source. Hindi kami nagpapanggap.
                </h2>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  <Link href="/methodology" className="link-arrow min-h-11 text-sm text-sun">
                    Paano namin kinukuha ang datos <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href="https://www.pagasa.dost.gov.ph/weather/heat-index"
                    target="_blank"
                    rel="noreferrer"
                    className="link-arrow min-h-11 text-sm text-[#d7e3d8]"
                  >
                    Heat index ng PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3 lg:gap-5">
                <div className="border-t border-white/20 pt-3">
                  <dt className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#9db6a2]">Weather</dt>
                  <dd className="mt-1 text-sm font-bold leading-6 text-white">Model data, may oras at source</dd>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <dt className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#9db6a2]">Heat index</dt>
                  <dd className="mt-1 text-sm font-bold leading-6 text-white">Estimate ng app, hindi PAGASA reading</dd>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <dt className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#9db6a2]">Mga lugar</dt>
                  <dd className="mt-1 text-sm font-bold leading-6 text-white">May label kung beripikado</dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="emergency-heading" className="flex gap-3.5 rounded-[1.5rem] border border-[#dfb1ac] bg-[#fbeceb] p-5">
            <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
            <div>
              <h2 id="emergency-heading" className="font-display text-base font-bold leading-snug text-[#3f1210]">
                Emergency? Huwag maghintay.
              </h2>
              <p className="mt-1 text-sm leading-7 text-[#6b2d28]">
                Kung pinaghihinalaang heat stroke o may emergency na delikado sa buhay, tumawag agad sa{" "}
                <a href="tel:911" className="font-bold underline">
                  911
                </a>{" "}
                o sa lokal na emergency service. Hindi kapalit ng opisyal na babala ang site na ito.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/map">
                <Sun className="h-4 w-4" aria-hidden="true" /> Tingnan ang mapa ng init
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/about">Ano ang SILONG PH?</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
