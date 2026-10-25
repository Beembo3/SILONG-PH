import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { AlertComposer } from "@/components/admin/alert-composer";
import { AlertStatusButton } from "@/components/admin/alert-status-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isAlertActive } from "@/lib/alerts";
import { hasRole, requirePageUser } from "@/lib/auth";
import { formatPST } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Official alerts" };

export default async function AdminAlertsPage() {
  const user = await requirePageUser();
  const canManage = hasRole(user, ["SUPER_ADMIN"]);
  const alerts = await prisma.officialAlert.findMany({
    orderBy: [{ issuedAt: "desc" }],
    take: 100,
  });
  const active = alerts.filter((alert) => isAlertActive(alert));
  const history = alerts.filter((alert) => !isAlertActive(alert));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Official information</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Official alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.length} active · {history.length} in history. Every record must have a verifiable source.
          </p>
        </div>
        <Link href="/alerts" className="text-xs font-semibold text-primary hover:underline">
          View public alerts page
        </Link>
      </div>

      {!canManage ? (
        <Alert variant="info" title="Read-only access">
          Only a super administrator can record or change official advisories. You can still view the current records
          and their sources.
        </Alert>
      ) : null}

      {canManage ? <AlertComposer /> : null}

      <section aria-labelledby="active-alerts-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="active-alerts-heading" className="text-lg font-bold text-navy">
            Active records
          </h2>
          <Badge variant={active.length > 0 ? "warning" : "outline"}>{active.length}</Badge>
        </div>
        {active.length === 0 ? (
          <Card className="mt-3">
            <CardContent className="flex items-start gap-3 py-6">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-navy">No active official advisory is recorded</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This does not mean there is no advisory in effect. Check PAGASA, NDRRMC, and your LGU directly. Record
                  one here only when you have a verifiable source.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-3 space-y-3">
            {active.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="warning">{alert.severity}</Badge>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-navy">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {alert.issuer} · {alert.affectedArea}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>Issued {formatPST(alert.issuedAt)}</p>
                      <p>{alert.expiresAt ? `Expires ${formatPST(alert.expiresAt)}` : "No expiry"}</p>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{alert.description}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    {canManage ? <AlertStatusButton alertId={alert.id} status={alert.status} /> : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="alert-history-heading">
        <h2 id="alert-history-heading" className="text-lg font-bold text-navy">
          History
        </h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No expired or archived advisories recorded.</p>
        ) : (
          <Card className="mt-3">
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <caption className="sr-only">Official advisory history</caption>
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3">Advisory</th>
                    <th scope="col" className="px-4 py-3">Issuer</th>
                    <th scope="col" className="px-4 py-3">Issued</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((alert) => (
                    <tr key={alert.id} className="border-t border-border align-top">
                      <td className="px-4 py-3 font-semibold text-navy">{alert.title}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{alert.issuer}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatPST(alert.issuedAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={alert.status === "EXPIRED" ? "secondary" : "danger"}>{alert.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
