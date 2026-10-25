import type { Metadata } from "next";
import Link from "next/link";
import { FileWarning } from "lucide-react";
import { ReportModeration } from "@/components/admin/report-moderation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { formatPST } from "@/lib/format";
import { getLocality } from "@/lib/geography";
import { prisma } from "@/lib/prisma";
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS } from "@/lib/places";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reports" };

function str(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function pageHref(status: string, page: number): string {
  const search = new URLSearchParams();
  if (status && status !== "ALL") search.set("status", status);
  search.set("page", String(page));
  return `/admin/reports?${search.toString()}`;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePageUser();
  const raw = await searchParams;
  const status = str(raw.status) || "PENDING";
  const page = Math.max(1, Number(str(raw.page) || "1") || 1);
  const pageSize = 20;

  const where = status === "ALL" ? {} : { status };
  const [reports, total, counts] = await Promise.all([
    prisma.facilityReport.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        coolingPlace: { select: { id: true, name: true, verificationStatus: true } },
        reviewedBy: { select: { name: true } },
      },
    }),
    prisma.facilityReport.count({ where }),
    prisma.facilityReport.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countMap = Object.fromEntries(counts.map((item) => [item.status, item._count._all]));
  const totalAll = Object.values(countMap).reduce((sum, value) => sum + value, 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const tabs = [
    { value: "PENDING", label: "Pending", count: countMap.PENDING ?? 0 },
    { value: "REVIEWED", label: "Reviewed", count: countMap.REVIEWED ?? 0 },
    { value: "ACTIONED", label: "Actioned", count: countMap.ACTIONED ?? 0 },
    { value: "DISMISSED", label: "Dismissed", count: countMap.DISMISSED ?? 0 },
    { value: "ALL", label: "All", count: totalAll },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Moderation</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Facility reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public corrections and new-location suggestions. Reports do not change a facility automatically.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "PENDING" ? "/admin/reports" : `/admin/reports?status=${tab.value}`}
            aria-current={status === tab.value ? "page" : undefined}
            className={
              status === tab.value
                ? "rounded-full border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-900"
                : "rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-orange-300"
            }
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileWarning className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-navy">
              {status === "PENDING" ? "No pending reports" : "No reports in this queue"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              New public submissions will appear here. The public form is rate limited and moderated.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const proposedLocality = report.proposedLocalityCode
              ? getLocality(report.proposedLocalityCode)
              : undefined;
            return (
              <Card key={report.id} id={`report-${report.id}`}>
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={report.status === "PENDING" ? "warning" : "secondary"}>
                          {REPORT_STATUS_LABELS[report.status] ?? report.status}
                        </Badge>
                        <Badge variant="outline">
                          {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
                        </Badge>
                      </div>
                      <h2 className="mt-2 text-base font-bold text-navy">
                        {report.coolingPlace ? (
                          <Link href={`/admin/places/${report.coolingPlace.id}`} className="hover:text-primary hover:underline">
                            {report.coolingPlace.name}
                          </Link>
                        ) : (
                          report.proposedName ?? "New-location suggestion"
                        )}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatPST(report.submittedAt)} · Report {report.id}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {report.reviewedAt ? (
                        <p>
                          Reviewed {formatPST(report.reviewedAt)}
                          {report.reviewedBy?.name ? ` by ${report.reviewedBy.name}` : ""}
                        </p>
                      ) : (
                        <p>Not reviewed</p>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-slate-700">
                    {report.description}
                  </p>

                  {report.reportType === "NEW_LOCATION" || report.proposedName ? (
                    <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Proposed name</dt>
                        <dd className="mt-0.5 text-slate-700">{report.proposedName ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Proposed address</dt>
                        <dd className="mt-0.5 text-slate-700">{report.proposedAddress ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-muted-foreground">Locality</dt>
                        <dd className="mt-0.5 text-slate-700">
                          {proposedLocality ? `${proposedLocality.name}, ${proposedLocality.provinceName}` : "—"}
                        </dd>
                      </div>
                    </dl>
                  ) : null}

                  {report.moderatorNote ? (
                    <p className="mt-3 rounded-lg border border-border bg-white p-3 text-xs text-slate-600">
                      <strong>Previous moderator note:</strong> {report.moderatorNote}
                    </p>
                  ) : null}

                  <ReportModeration
                    reportId={report.id}
                    status={report.status}
                    note={report.moderatorNote}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(status, page - 1)}>Previous</Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={pageHref(status, page + 1)}>Next</Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
