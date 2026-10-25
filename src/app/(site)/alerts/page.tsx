import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Info, ShieldCheck, ShieldX } from "lucide-react";
import { HeatNotices } from "@/components/weather/heat-notices";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { alertSeverityVariant } from "@/lib/alerts";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Official alerts and heat notices",
  description:
    "Recorded official heat advisories with verifiable sources, plus clearly labelled application-generated heat notices for Central Luzon.",
};

export default async function AlertsPage() {
  const now = new Date();
  const officialAlerts = await prisma.officialAlert.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ issuedAt: "desc" }],
    take: 50,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Alerts</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
          Official advisories and heat notices
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          SILONG PH separates recorded official advisories from application-generated heat notices. Only an
          administrator can record an official advisory, and every official entry must include a verifiable source.
        </p>
      </div>

      <Alert variant="info" className="mt-5" title="How to read this page">
        <p>
          <strong>Official advisory</strong> means an authorised administrator recorded an alert from a named issuer
          with a source link. It is not a live PAGASA feed.{" "}
          <strong>Application heat notice</strong> means SILONG PH calculated an estimated heat index above a PAGASA
          category threshold. It is not an official warning.
        </p>
      </Alert>

      <section className="mt-8" aria-labelledby="official-alerts-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Recorded by administrators</p>
            <h2 id="official-alerts-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
              Official advisories
            </h2>
          </div>
          <Badge variant="outline">{officialAlerts.length} active</Badge>
        </div>

        {officialAlerts.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex items-start gap-3 py-6">
              <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-navy">No official heat advisory is recorded in this application</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  This does not mean there is no advisory in effect. SILONG PH does not automatically ingest PAGASA or
                  LGU advisories. Check the official channels directly.
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                  <a
                    href="https://www.pagasa.dost.gov.ph/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    DOST-PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <a
                    href="https://ndrrmc.gov.ph/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    NDRRMC <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <Link href="/preparedness" className="text-primary hover:underline">
                    Preparedness guidance
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {officialAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={alertSeverityVariant(alert.severity)}>{alert.severity}</Badge>
                        <Badge variant="outline">Official record</Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-navy">{alert.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        Issuer: {alert.issuer} · Affected area: {alert.affectedArea}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Issued {formatPST(alert.issuedAt)}</p>
                      <p>{alert.expiresAt ? `Expires ${formatPST(alert.expiresAt)}` : "No expiry recorded"}</p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{alert.description}</p>
                  <a
                    href={alert.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    Verify at the official source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <HeatNotices />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-bold text-navy">Verify before sharing</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Open the linked source and check the issuer, date, and affected area. Do not forward a screenshot without
              the source.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-bold text-navy">Not an emergency channel</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              For immediate danger, call 911 or your local emergency service. SILONG PH is not monitored 24/7 for
              emergency reports.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <Info className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-bold text-navy">How notices are generated</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              The application compares the estimated heat index at each province model point with PAGASA category
              thresholds. Read the{" "}
              <Link href="/methodology" className="font-semibold text-primary hover:underline">
                methodology
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
