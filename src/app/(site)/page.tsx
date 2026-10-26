import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Droplets,
  ExternalLink,
  Info,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sun,
} from "lucide-react";
import { HomeWeatherSummary } from "@/components/home/home-weather-summary";
import { RegionOverview } from "@/components/weather/region-overview";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { alertSeverityLabel, alertSeverityVariant } from "@/lib/alerts";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";

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
    title: "Tingnan ang mga babala",
    body: "Opisyal na abiso at heat notice ng app, may source at oras.",
    cta: "Buksan ang mga babala",
  },
  {
    href: "/cool-places",
    icon: MapPin,
    title: "Humanap ng preskong lugar",
    body: "Mall, aklatan, parke, at iba pang pampublikong lugar, may label kung beripikado.",
    cta: "Hanapin ang lugar",
  },
  {
    href: "/preparedness",
    icon: BookOpen,
    title: "Alamin ang dapat gawin",
    body: "Simpleng gabay bago at habang mainit, pati sintomas na dapat abangan.",
    cta: "Basahin ang gabay",
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
      <section className="border-b border-orange-100 bg-gradient-to-b from-orange-50 via-surface to-surface">
        <div className="mx-auto max-w-7xl px-4 pb-7 pt-6 sm:px-6 sm:pb-9 sm:pt-9 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-800">
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              Para sa Central Luzon
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              Ano ang lagay ng init ngayon?
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Makikita dito ang estimated heat index sa lugar mo, opisyal na babala, preskong lugar, at simpleng mga
              hakbang para manatiling ligtas.
            </p>
          </div>

          <HomeWeatherSummary />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
        <section aria-labelledby="official-alert-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Opisyal</p>
              <h2 id="official-alert-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
                May aktibong babala ba?
              </h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/alerts">
                Lahat ng babala <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {alertsUnavailable ? (
            <Alert variant="warning" className="mt-3" title="Hindi makuha ang official alerts ngayon">
              Hindi maabot ang alert records sa ngayon. Huwag ipagpalagay na walang babala. Tingnan ang{" "}
              <a
                href="https://www.pagasa.dost.gov.ph/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                DOST-PAGASA
              </a>{" "}
              at ang inyong LGU.
            </Alert>
          ) : latestAlert ? (
            <Card className="mt-3 overflow-hidden border-l-4 border-l-orange-500">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={alertSeverityVariant(latestAlert.severity)}>
                    {alertSeverityLabel(latestAlert.severity)}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">Aktibong opisyal na abiso</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold leading-snug text-navy">{latestAlert.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Para sa <strong>{latestAlert.affectedArea}</strong> · mula kay {latestAlert.issuer}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inilabas {formatPST(latestAlert.issuedAt)}
                  {latestAlert.expiresAt ? ` · hanggang ${formatPST(latestAlert.expiresAt)}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/alerts">Basahin ang opisyal na detalye</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={latestAlert.sourceUrl} target="_blank" rel="noreferrer">
                      Opisyal na source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert
              variant="info"
              className="mt-3"
              title="Walang naka-record na aktibong opisyal na babala sa SILONG PH ngayon"
            >
              Hindi ito nangangahulugang walang babala sa labas. I-check pa rin ang DOST-PAGASA at ang inyong LGU,
              lalo na kung mataas ang heat index sa lugar mo.
            </Alert>
          )}
        </section>

        <section aria-labelledby="primary-actions-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Ano ang susunod?</p>
            <h2 id="primary-actions-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Pumili ng gusto mong gawin
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group rounded-xl">
                  <Card className="h-full transition-colors group-hover:border-orange-300 group-hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-4 sm:p-5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-800">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-3 text-base font-extrabold leading-snug text-navy">{action.title}</h3>
                      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{action.body}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary">
                        {action.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="safety-tip-heading">
          <Card className="border-blue-200 bg-blue-50/60">
            <CardContent className="flex items-start gap-3 p-4 sm:p-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-800">
                <Droplets className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-800">Isang payo ngayon</p>
                <h2 id="safety-tip-heading" className="mt-1 text-lg font-extrabold leading-snug text-navy">
                  Uminom ng tubig bago ka mauhaw.
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  Magpahinga sa lilim o malamig na lugar tuwing mainit. Kung may sakit sa puso o kidney, sundin ang
                  payo ng doktor tungkol sa dami ng iniinom na tubig.
                </p>
                <Link href="/preparedness" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary">
                  Buong gabay sa paghahanda <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <RegionOverview compact />

        <section aria-labelledby="trust-heading" className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="trust-heading" className="text-base font-extrabold text-navy">
                Walang gawa-gawang reading
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Model data ang weather at estimate lang ang heat index ng app. Hindi ito opisyal na PAGASA reading.
                Ang mga opisyal na abiso ay may source at oras; ang mga lugar ay may malinaw na verification label.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                <Link href="/methodology" className="inline-flex min-h-11 items-center gap-1 text-primary">
                  Paano namin kinukuha ang datos <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="https://www.pagasa.dost.gov.ph/weather/heat-index"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 text-primary"
                >
                  Heat index ng PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Kung pinaghihinalaang heat stroke o may emergency na delikado sa buhay, tumawag agad sa 911 o sa lokal na
            emergency service. Hindi kapalit ng opisyal na babala ang site na ito.
          </span>
        </p>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/map">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Tingnan ang mapa ng init
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/about">Ano ang SILONG PH?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
