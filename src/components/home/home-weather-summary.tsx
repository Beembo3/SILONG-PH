"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Droplets, Info, MapPin, RefreshCw, Thermometer } from "lucide-react";
import { useLocation } from "@/components/location/location-provider";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <section aria-labelledby="home-weather-heading" className="mt-5">
      <Card className="overflow-hidden border-orange-200/80 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-gradient-to-r from-orange-50/80 to-white px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-800">Ngayon sa</p>
              <h2 id="home-weather-heading" className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-navy">
                {locality.name}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{province.name} · model grid point</p>
            </div>
            {category ? <RiskBadge category={category} /> : null}
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {view.loading ? (
              <div className="space-y-3" aria-live="polite">
                <p className="text-sm text-muted-foreground">Kinukuha ang pinakabagong weather…</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20 sm:col-span-1" />
                </div>
              </div>
            ) : view.error || !current || !category ? (
              <div className="space-y-3">
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
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-orange-100 bg-orange-50/60 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-800">
                      Tinatayang heat index
                    </p>
                    <p className="numeric mt-1 text-4xl font-extrabold leading-none text-navy">
                      {formatNumber(current.heatIndexC, 1)} °C
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface p-3">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Thermometer className="h-3.5 w-3.5" aria-hidden="true" /> Temperatura ng hangin
                    </p>
                    <p className="numeric mt-1 text-2xl font-extrabold text-navy">
                      {formatNumber(current.temperatureC, 1)} °C
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg border border-border bg-surface p-3 sm:col-span-1">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5" aria-hidden="true" /> Halumigmig
                    </p>
                    <p className="numeric mt-1 text-2xl font-extrabold text-navy">
                      {current.relativeHumidity == null ? "—" : `${current.relativeHumidity}%`}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-base font-semibold leading-snug text-navy">{category.taglish}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <WeatherIconView icon={current.icon} className="h-4 w-4" />
                    {conditionLabel(current.condition)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    Na-update {formatPST(view.data?.fetchedAt)}
                  </span>
                  {view.data?.stale ? (
                    <span className="font-semibold text-amber-800">Luma na ang data; i-check ang source.</span>
                  ) : null}
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Estimate lang ito ng app, hindi opisyal na PAGASA heat index reading. Sundin pa rin ang opisyal na
                  babala at payo ng LGU.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/localities/${locality.code}`}>
                      Tingnan ang buong detalye <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/map">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> Mapa ng init
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
