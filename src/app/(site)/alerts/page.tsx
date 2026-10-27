import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  Info,
  MapPin,
  ShieldCheck,
  ShieldX,
  Sun,
} from "lucide-react";
import { PageMasthead, SectionHeading } from "@/components/layout/page-masthead";
import { HeatNotices } from "@/components/weather/heat-notices";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alertSeverityLabel, alertSeverityVariant } from "@/lib/alerts";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mga opisyal na babala at heat notice",
  description:
    "Mga naka-record na opisyal na heat advisory na may mapapatunayan na source, kasama ang malinaw na label na heat notice na gawa ng app para sa Central Luzon.",
};

export default async function AlertsPage() {
  const now = new Date();
  let officialAlerts: Array<{
    id: string;
    title: string;
    description: string;
    affectedArea: string;
    severity: string;
    issuer: string;
    issuedAt: Date;
    expiresAt: Date | null;
    sourceUrl: string;
  }> = [];
  let alertsUnavailable = false;

  try {
    officialAlerts = await prisma.officialAlert.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ issuedAt: "desc" }],
      take: 50,
    });
  } catch {
    alertsUnavailable = true;
  }

  return (
    <div>
      <PageMasthead
        eyebrow="Mga babala"
        title="May opisyal na babala ba ngayon?"
        description="Hiwalay sa page na ito ang opisyal na abiso at ang heat notice na gawa ng app. Admin lang ang puwedeng mag-record ng official advisory, at kailangan may source ang bawat entry."
        actions={
          <>
            <Badge variant={officialAlerts.length > 0 ? "warning" : "secondary"} className="bg-white/10 text-white">
              {alertsUnavailable ? "Hindi makuha" : `${officialAlerts.length} aktibong official record`}
            </Badge>
            <Button asChild variant="inverse" size="sm">
              <Link href="/preparedness">
                <BookOpen className="h-4 w-4" aria-hidden="true" /> Mga dapat gawin
              </Link>
            </Button>
          </>
        }
      >
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[11px] font-bold text-[#d7e3d8]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
            Opisyal: may issuer at source
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[11px] font-bold text-[#d7e3d8]">
            <Sun className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
            Heat notice: estimate ng app
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[11px] font-bold text-[#d7e3d8]">
            <BookOpen className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
            Gabay: hindi babala
          </div>
        </div>
      </PageMasthead>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Alert variant="info" title="Paano basahin ang page na ito">
          <p>
            <strong>Official advisory</strong> ang naka-record na abiso mula sa named issuer na may source link. Hindi
            ito live PAGASA feed. <strong>Application heat notice</strong> ang estimate ng SILONG PH na umabot sa
            PAGASA category threshold. Hindi ito official warning.
          </p>
        </Alert>

        <section className="mt-10" aria-labelledby="official-alerts-heading">
          <SectionHeading
            eyebrow="Naka-record ng admin"
            id="official-alerts-heading"
            title="Opisyal na advisory"
            description="Bawat record ay may issuer, oras, affected area, at source link na puwedeng buksan."
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
          ) : officialAlerts.length === 0 ? (
            <div className="mt-5 flex gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef0e9] text-[#64736a]">
                <ShieldX className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-snug text-forest">
                  Walang naka-record na aktibong official heat advisory sa app na ito
                </p>
                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
                  Hindi ito nangangahulugang walang babala sa labas. Hindi awtomatikong kinukuha ng SILONG PH ang
                  PAGASA o LGU advisories. I-check mismo ang official channels.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
                  <a
                    href="https://www.pagasa.dost.gov.ph/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-primary"
                  >
                    DOST-PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://ndrrmc.gov.ph/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-primary"
                  >
                    NDRRMC <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <Link href="/preparedness" className="inline-flex min-h-11 items-center gap-1 text-primary">
                    Gabay sa paghahanda
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {officialAlerts.map((alert) => {
                const showFullText = ["DANGER", "EXTREME", "WARNING"].includes(alert.severity);
                const isUrgent = ["DANGER", "EXTREME"].includes(alert.severity);
                const railClass = isUrgent
                  ? "bg-[#b3261e]"
                  : alert.severity === "WARNING" || alert.severity === "WATCH"
                    ? "bg-[#c47a1e]"
                    : "bg-[#175e68]";
                return (
                  <article
                    key={alert.id}
                    className={cn(
                      "relative overflow-hidden rounded-[1.5rem] border bg-card shadow-[var(--shadow-soft)]",
                      isUrgent ? "border-[#dfb1ac]" : "border-border",
                    )}
                  >
                    <div className={cn("absolute inset-y-0 left-0 w-1.5", railClass)} aria-hidden="true" />
                    <div className="p-5 pl-6 sm:p-6 sm:pl-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={alertSeverityVariant(alert.severity)}>
                              {alertSeverityLabel(alert.severity)}
                            </Badge>
                            <Badge variant="outline">
                              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Opisyal na record
                            </Badge>
                          </div>
                          <h3 className="mt-3 break-words font-display text-xl font-bold leading-snug tracking-[-0.03em] text-forest sm:text-2xl">
                            {alert.title}
                          </h3>
                        </div>
                        <div className="w-full text-left text-[11px] leading-relaxed text-muted-foreground sm:w-auto sm:text-right">
                          <p>Inilabas {formatPST(alert.issuedAt)}</p>
                          <p>{alert.expiresAt ? `Hanggang ${formatPST(alert.expiresAt)}` : "Walang expiry na naka-record"}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#536258]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Para sa{" "}
                          <strong className="font-bold text-forest">{alert.affectedArea}</strong>
                        </span>
                        <span>Mula kay {alert.issuer}</span>
                      </div>

                      <details open={showFullText} className="group mt-4 rounded-2xl border border-border/80 bg-[#f8f3e9]">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-forest [&::-webkit-details-marker]:hidden">
                          Basahin ang opisyal na detalye
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="whitespace-pre-line break-words border-t border-border/70 px-4 py-4 text-sm leading-7 text-[#3f5146]">
                          {alert.description}
                        </p>
                      </details>

                      <a
                        href={alert.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link-arrow mt-3 min-h-11 text-sm text-primary"
                      >
                        I-verify sa opisyal na source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-12">
          <HeatNotices />
        </div>

        <section className="mt-12" aria-labelledby="verify-heading">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-[#e5eee3] p-5 sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 contour-lines-dark opacity-80" />
            <div className="relative flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-canopy">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="verify-heading" className="font-display text-xl font-bold text-forest">
                  I-verify bago i-share
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[#3f5146]">
                  <li className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                    Buksan ang source at tingnan ang issuer, petsa, at affected area. Huwag mag-forward ng screenshot
                    na walang source.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                    Hindi emergency channel ang SILONG PH. Para sa agarang panganib, tumawag sa 911 o lokal na
                    emergency service.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                    Ang heat notice ng app ay base sa estimated heat index sa province model point. Basahin ang{" "}
                    <Link href="/methodology" className="font-bold text-primary underline underline-offset-2">
                      methodology
                    </Link>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Kung may conflict sa official emergency instruction, sundin ang official instruction. Huwag hintayin ang app
            bago humingi ng tulong.
          </span>
        </p>
      </div>
    </div>
  );
}
