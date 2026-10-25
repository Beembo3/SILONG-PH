import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser, ROLE_LABELS } from "@/lib/auth";
import { formatPST, relativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { redisPing } from "@/lib/redis";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminDashboardPage() {
  const user = await requirePageUser();
  const now = new Date();

  const [
    totalPlaces,
    verifiedPlaces,
    pendingReports,
    activeAlerts,
    adminCount,
    recentReports,
    recentAudit,
    cache,
  ] = await Promise.all([
    prisma.coolingPlace.count({ where: { archivedAt: null } }),
    prisma.coolingPlace.count({ where: { archivedAt: null, verificationStatus: "VERIFIED" } }),
    prisma.facilityReport.count({ where: { status: "PENDING" } }),
    prisma.officialAlert.count({
      where: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.facilityReport.findMany({
      where: { status: "PENDING" },
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: {
        id: true,
        reportType: true,
        description: true,
        submittedAt: true,
        coolingPlace: { select: { name: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
    }),
    redisPing(),
  ]);

  const stats = [
    {
      label: "Active facility records",
      value: totalPlaces,
      detail: `${verifiedPlaces} verified · ${totalPlaces - verifiedPlaces} unverified`,
      icon: Building2,
      href: "/admin/places",
    },
    {
      label: "Pending reports",
      value: pendingReports,
      detail: pendingReports === 0 ? "Queue is clear" : "Needs moderation",
      icon: FileWarning,
      href: "/admin/reports?status=PENDING",
    },
    {
      label: "Active official alerts",
      value: activeAlerts,
      detail: activeAlerts === 0 ? "No recorded advisory" : "Currently published",
      icon: ShieldAlert,
      href: "/admin/alerts",
    },
    {
      label: "Active administrators",
      value: adminCount,
      detail: "Accounts with admin access",
      icon: Users,
      href: "/admin/audit",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Administration</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {user.name} · {ROLE_LABELS[user.role]}
          </p>
        </div>
        <Badge variant={cache.reachable ? "success" : "warning"}>
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          {cache.reachable ? `Redis ${cache.latencyMs ?? "?"} ms` : "Redis fallback"}
        </Badge>
      </div>

      {verifiedPlaces === 0 ? (
        <Alert variant="warning" title="No facility has been verified yet">
          All {totalPlaces} imported records are unverified public facilities. The public directory shows them with
          warnings. Review public access and cooling suitability before marking a record as verified.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon, href }) => (
          <Link key={label} href={href} className="group rounded-xl">
            <Card className="h-full transition-colors group-hover:border-orange-300">
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <p className="numeric mt-2 text-3xl font-extrabold text-navy">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Reports needing attention</CardTitle>
              <Link href="/admin/reports" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentReports.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                No pending reports. New public submissions will appear here.
              </div>
            ) : (
              <ul className="space-y-2">
                {recentReports.map((report) => (
                  <li key={report.id}>
                    <Link
                      href={`/admin/reports?status=PENDING#report-${report.id}`}
                      className="block rounded-lg border border-border p-3 hover:border-orange-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="warning">{report.reportType.replaceAll("_", " ")}</Badge>
                        <span className="text-xs text-muted-foreground">{relativeTime(report.submittedAt)}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-700">{report.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {report.coolingPlace?.name ?? "New-location suggestion"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Recent administrative activity</CardTitle>
              <Link href="/admin/audit" className="text-xs font-semibold text-primary hover:underline">
                Audit log
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAudit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No administrative actions recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recentAudit.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="font-semibold text-slate-800">{entry.action.replaceAll("_", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.entityType} · {entry.actor?.name ?? "System"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatPST(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickAction
          href="/admin/places/new"
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          title="Add a facility"
          body="Create a record with a source and coordinates. New records start as pending or unverified."
        />
        <QuickAction
          href="/admin/reports"
          icon={<FileWarning className="h-4 w-4" aria-hidden="true" />}
          title="Moderate reports"
          body="Review public corrections, record a moderator note, and update the queue status."
        />
        <QuickAction
          href="/admin/health"
          icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
          title="Check system health"
          body="Inspect database, Redis, weather provider, and production configuration checks."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white p-3 text-xs text-muted-foreground">
        <span>Overview generated {formatPST(new Date())}.</span>
        <Link href="/admin/health" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          System health <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="group rounded-xl">
      <Card className="h-full transition-colors group-hover:border-orange-300">
        <CardContent className="pt-5 sm:pt-6">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
            {icon}
          </div>
          <h2 className="mt-2 text-sm font-bold text-navy">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
