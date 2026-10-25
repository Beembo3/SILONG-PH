"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPST } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/weather/types";

interface RegionProvince {
  code: string;
  name: string;
  slug: string;
  capitalName: string;
  weather: WeatherSnapshot | null;
}

interface RegionResponse {
  provinces: RegionProvince[];
  fetchedAt: string;
  stale: boolean;
  note: string;
}

export function RegionOverview() {
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

  return (
    <section aria-labelledby="region-overview-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Region III overview</p>
          <h2 id="region-overview-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            Heat across Central Luzon
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Model conditions at each province&apos;s capital or representative point. These are not province-wide
            measurements and must not be read as barangay-level readings.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="warning" className="mt-4" title="Regional overview unavailable">
          {error} No synthetic province readings have been substituted.{" "}
          <button className="font-semibold underline" onClick={retry}>
            Retry
          </button>
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.provinces.map((province) => {
              const current = province.weather?.current;
              return (
                <Link key={province.code} href={`/provinces/${province.slug}`} className="group rounded-xl">
                  <Card className="h-full transition-colors group-hover:border-orange-300 group-hover:shadow-md">
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-navy">{province.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Model point: {province.capitalName}</p>
                        </div>
                        {current ? (
                          <WeatherIconView icon={current.icon} className="h-6 w-6 text-slate-400" />
                        ) : null}
                      </div>
                      {current ? (
                        <>
                          <div className="mt-4 flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Est. heat index
                              </p>
                              <p className="numeric text-3xl font-extrabold text-navy">
                                {current.heatIndexC != null ? formatNumber(current.heatIndexC, 1) : "—"}
                                <span className="text-sm font-semibold text-muted-foreground"> °C</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Air temp
                              </p>
                              <p className="numeric text-sm font-bold text-slate-700">
                                {current.temperatureC != null ? `${formatNumber(current.temperatureC, 1)} °C` : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <RiskBadge category={current.heatIndexCategory} />
                          </div>
                        </>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">Weather unavailable for this point.</p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Province details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {data.stale ? "Regional data is stale. " : ""}
            Retrieved {formatPST(data.fetchedAt)}. {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
