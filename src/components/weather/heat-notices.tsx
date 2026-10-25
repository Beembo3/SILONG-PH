"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/weather/risk-badge";
import { formatPST } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/weather/types";

interface RegionResponse {
  provinces: Array<{
    code: string;
    name: string;
    slug: string;
    capitalName: string;
    weather: WeatherSnapshot | null;
  }>;
  fetchedAt: string;
  stale: boolean;
  note: string;
}

const NOTICE_LEVELS = new Set(["extreme_caution", "danger", "extreme_danger"]);

export function HeatNotices() {
  const [data, setData] = useState<RegionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/weather/region?_=${Date.now()}`, {
        signal,
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Regional weather is unavailable.");
      setData(body as RegionResponse);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Regional weather is unavailable.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The async loader only updates state after the fetch settles. The rule
    // cannot see through the promise boundary and flags any called setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  const notices =
    data?.provinces.filter(
      (province) =>
        province.weather?.current.heatIndexC != null &&
        NOTICE_LEVELS.has(province.weather.current.heatIndexCategory.level),
    ) ?? [];

  return (
    <section aria-labelledby="heat-notices-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Application-generated notices</p>
          <h2 id="heat-notices-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            Current heat notices
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            These notices are calculated by SILONG PH from estimated heat index at each province&apos;s model point.
            They are <strong>not official advisories</strong> and do not replace PAGASA, DOH, NDRRMC, or LGU guidance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="warning" className="mt-4" title="Heat notices unavailable">
          {error} No synthetic notice has been substituted. Check official sources below.
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : null}

      {data ? (
        <>
          {notices.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="flex items-start gap-3 py-6">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-navy">
                    No province model point is currently at Extreme Caution or above
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This is based on the latest retrieved model data, not a guarantee that conditions are safe
                    everywhere. Local heat can be higher, especially in dense urban areas and direct sun.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {notices.map((province) => {
                const current = province.weather?.current;
                if (!current) return null;
                return (
                  <Card key={province.code} className="border-orange-200">
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                            Application heat notice · not official
                          </p>
                          <h3 className="mt-1 text-base font-bold text-navy">{province.name}</h3>
                          <p className="text-xs text-muted-foreground">Model point: {province.capitalName}</p>
                        </div>
                        <RiskBadge category={current.heatIndexCategory} />
                      </div>
                      <p className="mt-3 text-sm text-slate-700">
                        Estimated heat index{" "}
                        <strong>{current.heatIndexC != null ? `${current.heatIndexC.toFixed(1)} °C` : "unavailable"}</strong>
                        . {current.heatIndexCategory.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <Link href={`/provinces/${province.slug}`} className="text-primary hover:underline">
                          Province details
                        </Link>
                        <Link href="/preparedness" className="text-slate-600 hover:underline">
                          What to do
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Retrieved {formatPST(data.fetchedAt)}. {data.stale ? "The regional snapshot is stale. " : ""}
            {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
