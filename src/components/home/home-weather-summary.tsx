"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Droplets, Info, MapPin, RefreshCw, Thermometer, Wind } from "lucide-react";
import { useLocation } from "@/components/location/location-provider";
import { HeatMeter } from "@/components/weather/heat-meter";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { conditionLabel, formatNumber, formatPST } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/weather/types";

interface WeatherState {
  key: string;
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
}

export function HomeWeatherSummary() {
  const { locality, province } = useLocation();
  const localityKey = locality.code;
  const [state, setState] = useState<WeatherState>({
    key: localityKey,
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(
          `/api/weather?lat=${encodeURIComponent(locality.lat)}&lon=${encodeURIComponent(locality.lon)}`,
          { cache: "no-store", signal },
        );
        if (signal?.aborted) return;
        if (!response.ok) throw new Error("Hindi available ang weather sa ngayon.");
        const data = (await response.json()) as WeatherSnapshot;
        if (signal?.aborted) return;
        setState({ key: localityKey, data, loading: false, error: null });
      } catch {
        if (signal?.aborted) return;
        setState({
          key: localityKey,
          data: null,
          loading: false,
          error: "Hindi makuha ang weather ngayon. Subukan muli.",
        });
      }
    },
    [locality.lat, locality.lon, localityKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    // The async loader only updates state after the fetch settles. The rule
    // cannot see through the promise boundary and flags any called setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const view: WeatherState =
    state.key === localityKey
      ? state
      : { key: localityKey, data: null, loading: true, error: null };
  const current = view.data?.current;
  const category = current?.heatIndexCategory;

  const retry = () => {
    setState({ key: localityKey, data: null, loading: true, error: null });
    void load();
  };

  return (
    <section aria-labelledby="home-weather-heading" className="relative">
      <div className="paper-panel overflow-hidden rounded-[1.75rem] sm:rounded-[2.15rem]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/75 px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="eyebrow text-sun-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden="true" />
              Ngayon sa
            </p>
            <h2
              id="home-weather-heading"
              className="mt-1.5 truncate font-display text-2xl font-bold tracking-[-0.04em] text-forest sm:text-3xl"
            >
              {locality.name}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-canopy" aria-hidden="true" />
              {province.name} · model grid point
            </p>
          </div>
          {category ? <RiskBadge category={category} /> : null}
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {view.loading ? (
            <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]" aria-live="polite">
              <div className="flex flex-col items-center justify-center gap-3 rounded-[1.35rem] bg-[#f8f1e3] p-5">
                <p className="text-sm font-semibold text-muted-foreground">Kinukuha ang pinakabagong weather…</p>
                <Skeleton className="h-36 w-52 rounded-[2rem]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>
          ) : view.error || !current || !category ? (
            <div className="space-y-4">
              <Alert variant="warning" title="Walang weather sa ngayon">
                {view.error ?? "Walang kumpletong weather data na naibalik ng provider."}
              </Alert>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={retry}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> Subukan muli
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/alerts">Tingnan ang mga opisyal na babala</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:gap-8">
              <div className="relative flex flex-col items-center overflow-hidden rounded-[1.4rem] bg-[#f8f1e3] px-4 pb-4 pt-3 sm:px-5">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 sun-glow" />
                <div className="relative w-full">
                  <HeatMeter category={category} valueC={current.heatIndexC} />
                </div>
                <p className="relative mt-1 text-center font-display text-[15px] font-bold leading-snug text-forest">
                  {category.taglishLabel}
                </p>
                <p className="relative mt-1 max-w-sm text-center text-xs leading-relaxed text-[#536258]">
                  {category.taglish}
                </p>
              </div>

              <div className="min-w-0">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="border-b border-border/70 pb-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                      <Thermometer className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Hangin
                    </dt>
                    <dd className="numeric mt-1 text-2xl font-bold text-forest">
                      {formatNumber(current.temperatureC, 1)}
                      <span className="ml-0.5 text-sm font-bold text-muted-foreground">°C</span>
                    </dd>
                  </div>
                  <div className="border-b border-border/70 pb-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Halumigmig
                    </dt>
                    <dd className="numeric mt-1 text-2xl font-bold text-forest">
                      {current.relativeHumidity == null ? "—" : `${current.relativeHumidity}%`}
                    </dd>
                  </div>
                  <div className="border-b border-border/70 pb-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                      <Wind className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Lagay
                    </dt>
                    <dd className="mt-1 flex min-h-8 items-center gap-1.5 text-sm font-bold leading-snug text-forest">
                      <WeatherIconView icon={current.icon} className="h-4 w-4" />
                      {conditionLabel(current.condition)}
                    </dd>
                  </div>
                  <div className="border-b border-border/70 pb-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-canopy" aria-hidden="true" /> Na-update
                    </dt>
                    <dd className="mt-1 text-xs font-semibold leading-snug text-forest">
                      {formatPST(view.data?.fetchedAt)}
                    </dd>
                  </div>
                </dl>

                {view.data?.stale ? (
                  <p className="mt-3 rounded-xl border border-[#e2c48e] bg-[#fbf1dc] px-3 py-2 text-xs font-bold leading-relaxed text-[#7a4300]">
                    Luma na ang data; i-check ang opisyal na source.
                  </p>
                ) : null}

                <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Estimate lang ito ng app, hindi opisyal na PAGASA heat index reading. Sundin pa rin ang opisyal na
                  babala at payo ng LGU.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/localities/${locality.code}`}>
                      Buong detalye <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/map">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Mapa ng init
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
