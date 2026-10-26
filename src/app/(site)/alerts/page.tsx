import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, ExternalLink, Info, ShieldCheck, ShieldX } from "lucide-react";
import { HeatNotices } from "@/components/weather/heat-notices";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { alertSeverityLabel, alertSeverityVariant } from "@/lib/alerts";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";

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
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mga babala</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          May opisyal na babala ba ngayon?
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Hiwalay sa page na ito ang opisyal na abiso at ang heat notice na gawa ng app. Admin lang ang puwedeng
          mag-record ng official advisory, at kailangan may source ang bawat entry.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
        <Badge variant={officialAlerts.length > 0 ? "warning" : "secondary"} className="w-fit">
          {alertsUnavailable ? "Hindi makuha" : `${officialAlerts.length} aktibong official record`}
        </Badge>
        <Alert variant="info" title="Paano basahin ang page na ito">
          <p>
            <strong>Official advisory</strong> ang naka-record na abiso mula sa named issuer na may source link. Hindi
            ito live PAGASA feed. <strong>Application heat notice</strong> ang estimate ng SILONG PH na umabot sa
            PAGASA category threshold. Hindi ito official warning.
          </p>
        </Alert>
      </div>

      <section className="mt-8" aria-labelledby="official-alerts-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Naka-record ng admin</p>
            <h2 id="official-alerts-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Opisyal na advisory
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/preparedness">Mga dapat gawin</Link>
          </Button>
        </div>

        {alertsUnavailable ? (
          <Alert variant="warning" className="mt-4" title="Hindi makuha ang official alerts ngayon">
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
        ) : officialAlerts.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex items-start gap-3 py-6">
              <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-navy">
                  Walang naka-record na aktibong official heat advisory sa app na ito
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Hindi ito nangangahulugang walang babala sa labas. Hindi awtomatikong kinukuha ng SILONG PH ang
                  PAGASA o LGU advisories. I-check mismo ang official channels.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
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
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {officialAlerts.map((alert) => {
              const showFullText = ["DANGER", "EXTREME", "WARNING"].includes(alert.severity);
              return (
                <Card key={alert.id}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={alertSeverityVariant(alert.severity)}>
                            {alertSeverityLabel(alert.severity)}
                          </Badge>
                          <Badge variant="outline">Official na record</Badge>
                        </div>
                        <h3 className="mt-2 break-words text-lg font-extrabold leading-snug text-navy">
                          {alert.title}
                        </h3>
                        <p className="mt-1 break-words text-sm text-slate-600">
                          Para sa <strong>{alert.affectedArea}</strong> · mula kay {alert.issuer}
                        </p>
                      </div>
                      <div className="w-full text-left text-xs text-muted-foreground sm:w-auto sm:text-right">
                        <p>Inilabas {formatPST(alert.issuedAt)}</p>
                        <p>{alert.expiresAt ? `Hanggang ${formatPST(alert.expiresAt)}` : "Walang expiry na naka-record"}</p>
                      </div>
                    </div>

                    <details open={showFullText} className="group mt-3 rounded-lg border border-border bg-surface">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-bold text-navy [&::-webkit-details-marker]:hidden">
                        Basahin ang opisyal na detalye
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <p className="whitespace-pre-line break-words border-t border-border px-3 py-3 text-sm leading-relaxed text-slate-700">
                        {alert.description}
                      </p>
                    </details>

                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:underline"
                    >
                      I-verify sa opisyal na source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-10">
        <HeatNotices />
      </div>

      <section className="mt-10" aria-labelledby="verify-heading">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
              <div>
                <h2 id="verify-heading" className="text-base font-extrabold text-navy">
                  I-verify bago i-share
                </h2>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    Buksan ang source at tingnan ang issuer, petsa, at affected area. Huwag mag-forward ng screenshot
                    na walang source.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    Hindi emergency channel ang SILONG PH. Para sa agarang panganib, tumawag sa 911 o lokal na
                    emergency service.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    Ang heat notice ng app ay base sa estimated heat index sa province model point. Basahin ang{" "}
                    <Link href="/methodology" className="font-semibold text-primary hover:underline">
                      methodology
                    </Link>
                    .
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Kung may conflict sa official emergency instruction, sundin ang official instruction. Huwag hintayin ang app
          bago humingi ng tulong.
        </span>
      </p>
    </div>
  );
}
