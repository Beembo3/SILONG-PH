/* eslint-disable react-hooks/purity -- This server component intentionally samples live system time and provider latency for operational health reporting. */
import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Database, KeyRound, RefreshCw, Server, ShieldCheck, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { formatPST, relativeTime } from "@/lib/format";
import { getDefaultLocality } from "@/lib/geography";
import { prisma } from "@/lib/prisma";
import { isRedisConfigured, redisPing } from "@/lib/redis";
import { getWeather } from "@/lib/weather/open-meteo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "System health" };

interface Check {
  label: string;
  ok: boolean;
  detail: string;
  required?: boolean;
}

export default async function AdminHealthPage() {
  await requirePageUser();

  const dbStarted = Date.now();
  let dbOk = true;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbOk = false;
    dbError = error instanceof Error ? error.message : "Database query failed.";
  }
  const dbLatency = Date.now() - dbStarted;

  const cache = await redisPing();
  const locality = getDefaultLocality();

  const weatherStarted = Date.now();
  let weatherOk = true;
  let weatherError: string | null = null;
  let weatherSummary: string | null = null;
  let weatherStale = false;
  let weatherFetchedAt: string | null = null;
  try {
    const snapshot = await getWeather(locality.lat, locality.lon);
    weatherStale = snapshot.stale;
    weatherFetchedAt = snapshot.fetchedAt;
    weatherSummary = `Estimated heat index ${
      snapshot.current.heatIndexC != null ? `${snapshot.current.heatIndexC.toFixed(1)} °C` : "unavailable"
    } · ${snapshot.current.heatIndexCategory.label}`;
  } catch (error) {
    weatherOk = false;
    weatherError = error instanceof Error ? error.message : "Weather provider unavailable.";
  }
  const weatherLatency = Date.now() - weatherStarted;

  const now = new Date();
  const [places, verified, pendingReports, users, activeAlerts, articles, failedLogins, alertsMissingSource] =
    await Promise.all([
      prisma.coolingPlace.count({ where: { archivedAt: null } }),
      prisma.coolingPlace.count({ where: { archivedAt: null, verificationStatus: "VERIFIED" } }),
      prisma.facilityReport.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.officialAlert.count({
        where: {
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      prisma.preparednessArticle.count({ where: { status: "PUBLISHED" } }),
      prisma.auditLog.count({
        where: {
          action: "LOGIN_FAILED",
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.officialAlert.count({
        where: {
          status: "ACTIVE",
          OR: [{ sourceUrl: "" }, { issuer: "" }],
        },
      }),
    ]);

  const production = process.env.NODE_ENV === "production";
  const authSecretLength = process.env.AUTH_SECRET?.length ?? 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const checks: Check[] = [
    {
      label: "Database reachable",
      ok: dbOk,
      detail: dbOk ? `Responded in ${dbLatency} ms.` : dbError ?? "Database query failed.",
      required: true,
    },
    {
      label: "AUTH_SECRET strength",
      ok: authSecretLength >= 32,
      detail:
        authSecretLength === 0
          ? "AUTH_SECRET is not set. Sessions cannot be signed."
          : `Configured with ${authSecretLength} characters (minimum 32).`,
      required: true,
    },
    {
      label: "Public application URL",
      ok: Boolean(appUrl) && (!production || appUrl.startsWith("https://")),
      detail: appUrl
        ? `${appUrl}${production && !appUrl.startsWith("https://") ? " — production should use HTTPS." : ""}`
        : "NEXT_PUBLIC_APP_URL is not set; origin checks and metadata use localhost defaults.",
      required: true,
    },
    {
      label: "Redis cache",
      ok: !isRedisConfigured() || cache.reachable,
      detail: !isRedisConfigured()
        ? "Not configured. The app uses in-process cache and rate limiting."
        : cache.reachable
          ? `Reachable in ${cache.latencyMs ?? "?"} ms.`
          : "Configured but unreachable. The app is using the in-process fallback.",
    },
    {
      label: "Scheduled weather refresh secret",
      ok: Boolean(process.env.CRON_SECRET),
      detail: process.env.CRON_SECRET
        ? "CRON_SECRET is configured; /api/cron/weather can be scheduled."
        : "CRON_SECRET is not set. Scheduled cache warming is disabled.",
    },
    {
      label: "Seed-only admin password",
      ok: !process.env.ADMIN_PASSWORD,
      detail: process.env.ADMIN_PASSWORD
        ? "ADMIN_PASSWORD is still present in the environment. Remove it after seeding in production."
        : "ADMIN_PASSWORD is not present. Good for production.",
      required: production,
    },
    {
      label: "Weather provider",
      ok: weatherOk,
      detail: weatherOk
        ? `${weatherSummary ?? "Snapshot received"} in ${weatherLatency} ms${weatherStale ? " (stale snapshot)" : ""}.`
        : weatherError ?? "Provider unavailable.",
    },
  ];

  const requiredFailures = checks.filter((check) => check.required && !check.ok);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Operations</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">System health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Checked {formatPST(new Date())}. Secrets are never displayed on this page.
          </p>
        </div>
        <Badge variant={requiredFailures.length === 0 ? "success" : "danger"}>
          {requiredFailures.length === 0 ? "Required checks pass" : `${requiredFailures.length} required check(s) failing`}
        </Badge>
      </div>

      {requiredFailures.length > 0 ? (
        <Alert variant="danger" title="Production configuration needs attention">
          <ul className="list-disc space-y-1 pl-4">
            {requiredFailures.map((check) => (
              <li key={check.label}>
                <strong>{check.label}:</strong> {check.detail}
              </li>
            ))}
          </ul>
        </Alert>
      ) : (
        <Alert variant="success" title="Required checks pass">
          Database, authentication configuration, public URL, and weather provider are available. Review optional checks
          and the production checklist before launch.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Database latency" value={dbOk ? `${dbLatency} ms` : "Down"} icon={<Database className="h-4 w-4" aria-hidden="true" />} />
        <Stat
          label="Cache mode"
          value={cache.reachable ? "Redis" : isRedisConfigured() ? "Fallback" : "In-process"}
          icon={<Server className="h-4 w-4" aria-hidden="true" />}
        />
        <Stat
          label="Weather provider"
          value={weatherOk ? `${weatherLatency} ms` : "Unavailable"}
          icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
        />
        <Stat
          label="Failed logins (24 h)"
          value={String(failedLogins)}
          icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
            >
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">
                  {check.label}
                  {check.required ? <span className="ml-1 text-[10px] font-bold uppercase text-red-700">required</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">{check.detail}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content and accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Item label="Active places" value={places} />
              <Item label="Verified places" value={verified} />
              <Item label="Pending reports" value={pendingReports} />
              <Item label="Active admins" value={users} />
              <Item label="Active alerts" value={activeAlerts} />
              <Item label="Published articles" value={articles} />
            </dl>
            {verified === 0 ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">
                No facility is verified. The public directory is showing unverified public-facility records with
                warnings.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data freshness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-slate-700">
                {weatherFetchedAt
                  ? `Weather snapshot retrieved ${formatPST(weatherFetchedAt)} (${relativeTime(weatherFetchedAt)}).`
                  : "No weather snapshot available."}
                {weatherStale ? " The snapshot is stale." : ""}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Fresh weather is cached for 10 minutes; a stale snapshot may be served for up to 3 hours with a visible
              warning. Redis shares the cache across instances when available. Use{" "}
              <code className="rounded bg-muted px-1 py-0.5">/api/cron/weather</code> with a bearer secret to warm the
              regional cache.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A public uptime endpoint is available at <code className="rounded bg-muted px-1 py-0.5">/api/health</code>.
              It reports database and cache reachability without exposing secrets.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            <CheckItem ok={production} label="Run with NODE_ENV=production and a production build." />
            <CheckItem ok={authSecretLength >= 32} label="Set a unique AUTH_SECRET of at least 32 characters." />
            <CheckItem ok={Boolean(appUrl) && appUrl.startsWith("https://")} label="Serve over HTTPS and set NEXT_PUBLIC_APP_URL to the public HTTPS origin." />
            <CheckItem ok={!process.env.ADMIN_PASSWORD} label="Remove ADMIN_PASSWORD from the production environment after seeding." />
            <CheckItem ok={Boolean(process.env.CRON_SECRET)} label="Set CRON_SECRET and schedule /api/cron/weather every 10 minutes." />
            <CheckItem ok={dbOk} label="Use a managed PostgreSQL/Supabase database with backups and restricted credentials." />
            <CheckItem ok={!isRedisConfigured() || cache.reachable} label="Configure Redis for shared caching and rate limiting, or accept single-instance fallback." />
            <CheckItem ok={verified > 0} label="Review and verify facility records before presenting them as cooling places." />
            <CheckItem
              ok={alertsMissingSource === 0}
              label="Active official advisories have a recorded issuer and source URL."
            />
          </ul>
          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            This checklist is a deployment aid, not a security certification. Follow your organisation&apos;s security
            and data-protection review.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {icon}
          {label}
        </p>
        <p className="numeric mt-2 text-2xl font-extrabold text-navy">{value}</p>
      </CardContent>
    </Card>
  );
}

function Item({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="numeric text-lg font-bold text-navy">{value}</dd>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      )}
      <span>{label}</span>
    </li>
  );
}
