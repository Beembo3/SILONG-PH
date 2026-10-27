"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, RefreshCw, ThermometerSun } from "lucide-react";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

export function RegionOverview({ compact = false }: { compact?: boolean }) {
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
      if (!response.ok) throw new Error(body.error ?? "Hindi available ang regional weather.");
      setData(body as RegionResponse);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Hindi available ang regional weather.");
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

  const withWeather = (data?.provinces ?? [])
    .filter((province): province is RegionProvince & { weather: WeatherSnapshot } => Boolean(province.weather))
    .sort(
      (a, b) =>
        (b.weather.current.heatIndexC ?? Number.NEGATIVE_INFINITY) -
        (a.weather.current.heatIndexC ?? Number.NEGATIVE_INFINITY),
    );
  const hottest = withWeather[0];
  const elevatedCount = withWeather.filter((province) =>
    ["extreme_caution", "danger", "extreme_danger"].includes(province.weather.current.heatIndexCategory.level),
  ).length;

  if (compact) {
    return (
      <section aria-labelledby="region-overview-heading">
        <div className="paper-panel overflow-hidden rounded-[1.7rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/75 px-5 py-4 sm:px-6">
            <div>
              <p className="eyebrow text-sun-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden="true" /> Sa buong rehiyon
              </p>
              <h2
                id="region-overview-heading"
                className="mt-1.5 font-display text-2xl font-bold tracking-[-0.04em] text-forest"
              >
                Central Luzon ngayon
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={retry} disabled={loading}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> I-refresh
            </Button>
          </div>

          {error ? (
            <div className="p-5 sm:p-6">
              <Alert variant="warning" title="Hindi available ang regional overview">
                {error} Walang gawa-gawang province reading na ipinalit.{" "}
                <button className="font-bold underline" onClick={retry}>
                  Subukan muli
                </button>
              </Alert>
            </div>
          ) : null}

          {loading && !data ? (
            <div className="space-y-3 p-5 sm:p-6" aria-busy="true" aria-label="Kinukuha ang regional overview">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          ) : null}

          {data && hottest ? (
            <>
              <div className="grid sm:grid-cols-[1fr_auto]">
                <div className="p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground">
                    <ThermometerSun className="h-3.5 w-3.5 text-canopy" aria-hidden="true" />
                    Pinakamainit sa model points
                  </p>
                  <Link
                    href={`/provinces/${hottest.slug}`}
                    className="mt-2 inline-flex max-w-full items-baseline gap-2.5 rounded-lg font-display text-2xl font-bold tracking-[-0.04em] text-forest transition-colors hover:text-canopy sm:text-3xl"
                  >
                    <span className="truncate">{hottest.name}</span>
                    <span className="numeric shrink-0 text-sun-ink">
                      {formatNumber(hottest.weather.current.heatIndexC, 1)}
                      <span className="ml-0.5 text-sm font-bold">°C</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
                  </Link>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {elevatedCount > 0
                      ? `${elevatedCount} probinsya ang nasa extreme caution o mas mataas.`
                      : "Wala pang probinsya sa extreme caution o mas mataas na category."}{" "}
                    Model point sa capital o representative point ang bawat reading, hindi province-wide measurement.
                  </p>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 border-t border-border/75 p-5 sm:border-l sm:border-t-0 sm:p-6">
                  <RiskBadge category={hottest.weather.current.heatIndexCategory} />
                  <Button asChild size="sm" variant="outline">
                    <Link href="/map">
                      Mapa ng init <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <span className="text-[11px] leading-relaxed text-muted-foreground">
                    Na-update {formatPST(data.fetchedAt)}
                    {data.stale ? " · luma na ang data" : ""}
                  </span>
                </div>
              </div>
              <p className="border-t border-border/75 px-5 py-3 text-[11px] leading-relaxed text-muted-foreground sm:px-6">
                {data.note}
              </p>
            </>
          ) : null}

          {data && !hottest ? (
            <p className="p-5 text-sm text-muted-foreground sm:p-6">
              Walang kumpletong regional weather data sa ngayon. Subukan ang mapa o ang page ng probinsya.
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="region-overview-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow text-sun-ink">
            <span className="h-px w-5 bg-sun-ink" aria-hidden="true" /> Overview ng Region III
          </p>
          <h2
            id="region-overview-heading"
            className="mt-2 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-bold leading-[1.03] tracking-[-0.04em] text-forest"
          >
            Init sa buong Central Luzon
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            Model conditions sa capital o representative point ng bawat probinsya. Hindi ito province-wide
            measurement at hindi dapat basahin bilang barangay-level reading.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> I-refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="warning" className="mt-4" title="Hindi available ang regional overview">
          {error} Walang gawa-gawang province reading na ipinalit.{" "}
          <button className="font-bold underline" onClick={retry}>
            Subukan muli
          </button>
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="mt-5 space-y-2" aria-busy="true" aria-label="Kinukuha ang regional overview">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[var(--shadow-soft)]">
            <div className="hidden grid-cols-[2.2rem_1fr_auto_auto] items-center gap-4 border-b border-border/75 px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted-foreground sm:grid">
              <span>#</span>
              <span>Probinsya at model point</span>
              <span className="text-right">Est. heat index</span>
              <span className="w-28" />
            </div>
            {data.provinces
              .slice()
              .sort(
                (a, b) =>
                  (b.weather?.current.heatIndexC ?? Number.NEGATIVE_INFINITY) -
                  (a.weather?.current.heatIndexC ?? Number.NEGATIVE_INFINITY),
              )
              .map((province, index) => {
                const current = province.weather?.current;
                return (
                  <Link
                    key={province.code}
                    href={`/provinces/${province.slug}`}
                    className="group grid gap-3 border-b border-border/70 px-5 py-4 transition-colors last:border-b-0 hover:bg-[#f8f3e9] sm:grid-cols-[2.2rem_1fr_auto_auto] sm:items-center sm:gap-4"
                  >
                    <span className="hidden whitespace-nowrap font-display text-lg font-bold text-[#6f8a7b] sm:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex min-w-0 items-center gap-3">
                      {current ? <WeatherIconView icon={current.icon} className="h-5 w-5 shrink-0 text-canopy" /> : null}
                      <div className="min-w-0">
                        <p className="font-display text-lg font-bold tracking-[-0.025em] text-forest">{province.name}</p>
                        <p className="text-xs text-muted-foreground">Model point: {province.capitalName}</p>
                      </div>
                    </div>
                    {current ? (
                      <div className="flex items-center gap-3 sm:justify-end">
                        <div className="text-right">
                          <p className="numeric text-2xl font-bold text-forest">
                            {current.heatIndexC != null ? formatNumber(current.heatIndexC, 1) : "—"}
                            <span className="ml-0.5 text-xs font-bold text-muted-foreground">°C</span>
                          </p>
                          <p className="text-[10px] font-semibold text-muted-foreground">
                            Hangin {current.temperatureC != null ? `${formatNumber(current.temperatureC, 1)} °C` : "—"}
                          </p>
                        </div>
                        <RiskBadge category={current.heatIndexCategory} className="hidden sm:inline-flex" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Walang weather sa point na ito.</p>
                    )}
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      {current ? <RiskBadge category={current.heatIndexCategory} className="sm:hidden" /> : null}
                      <span className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-primary">
                        Detalye <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {data.stale ? "Luma na ang regional data. " : ""}
            Nakuha {formatPST(data.fetchedAt)}. {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
