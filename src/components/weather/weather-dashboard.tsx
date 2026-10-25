"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {

  CalendarDays,
  Clock,
  Droplets,
  ExternalLink,
  Info,
  MapPin,
  RefreshCw,
  Thermometer,
  Wind,
} from "lucide-react";
import { useLocation } from "@/components/location/location-provider";
import { ForecastChart } from "@/components/weather/forecast-chart";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGASA_SOURCE } from "@/lib/heat-index";
import { formatDay, formatNumber, formatPST, relativeTime } from "@/lib/format";
import type { WeatherSnapshot } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

interface WeatherState {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
}

export function WeatherDashboard() {
  const { locality, province, hydrated } = useLocation();
  const [state, setState] = useState<WeatherState>({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fetch(
          `/api/weather?lat=${locality.lat}&lon=${locality.lon}&_=${Date.now()}`,
          { signal, cache: "no-store" },
        );
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Weather data is unavailable.");
        setState({ data: body as WeatherSnapshot, loading: false, error: null });
      } catch (error) {
        if (signal?.aborted) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Weather data is unavailable.",
        }));
      }
    },
    [locality.lat, locality.lon],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, attempt]);

  const weather = state.data;
  const current = weather?.current;
  const category = current?.heatIndexCategory;

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="weather-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-400">
            <span>Central Luzon</span>
            <span aria-hidden="true">/</span>
            <Link href={`/provinces/${province.slug}`} className="hover:text-white">
              {province.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-200">{locality.name}</span>
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                Current heat conditions
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {locality.name}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {locality.type}, {province.name} · model conditions at {locality.lat.toFixed(3)},{" "}
                {locality.lon.toFixed(3)}
              </p>

              {!hydrated || state.loading ? (
                <div className="mt-7 grid max-w-xl grid-cols-2 gap-4">
                  <Skeleton className="h-28 bg-white/10" />
                  <Skeleton className="h-28 bg-white/10" />
                </div>
              ) : state.error ? (
                <div className="mt-6 max-w-xl rounded-xl border border-red-300/30 bg-red-950/30 p-5">
                  <p className="font-semibold text-red-100">Weather data is temporarily unavailable</p>
                  <p className="mt-1 text-sm text-red-200">{state.error}</p>
                  <p className="mt-2 text-xs text-red-200/80">
                    No synthetic reading has been substituted. You can retry or check the official PAGASA page.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setAttempt((v) => v + 1)}>
                      <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                      <a href={PAGASA_SOURCE.url} target="_blank" rel="noreferrer">
                        PAGASA heat index <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Air temperature</p>
                      <p className="numeric mt-1 text-5xl font-extrabold sm:text-6xl">
                        {current?.temperatureC != null ? formatNumber(current.temperatureC, 1) : "—"}
                        <span className="ml-1 align-top text-2xl text-slate-300">°C</span>
                      </p>
                    </div>
                    <div className="h-16 w-px bg-white/15" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Estimated heat index
                      </p>
                      <p className="numeric mt-1 text-5xl font-extrabold text-orange-300 sm:text-6xl">
                        {current?.heatIndexC != null ? formatNumber(current.heatIndexC, 1) : "—"}
                        <span className="ml-1 align-top text-2xl text-orange-200">°C</span>
                      </p>
                      {current?.heatIndexC == null ? (
                        <p className="mt-1 text-xs text-slate-400">Unavailable — missing temperature or humidity input.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {category ? <RiskBadge category={category} /> : null}
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                      <WeatherIconView icon={current?.icon ?? "cloud"} className="h-4 w-4" />
                      {current?.condition ?? "Condition unavailable"}
                    </span>
                  </div>
                  <p className="mt-4 max-w-xl text-xs leading-relaxed text-slate-400">
                    Heat index is an application estimate calculated from temperature and relative humidity. It is
                    not an official PAGASA reading. Air temperature and the heat index are different measures.
                  </p>
                </>
              )}
            </div>

            {weather && current ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric
                  icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
                  label="Relative humidity"
                  value={current.relativeHumidity != null ? `${current.relativeHumidity}%` : "Unavailable"}
                />
                <Metric
                  icon={<Thermometer className="h-4 w-4" aria-hidden="true" />}
                  label="Apparent temperature"
                  value={
                    current.apparentTemperatureC != null
                      ? `${formatNumber(current.apparentTemperatureC, 1)} °C`
                      : "Unavailable"
                  }
                />
                <Metric
                  icon={<Wind className="h-4 w-4" aria-hidden="true" />}
                  label="Wind"
                  value={current.windSpeedKmh != null ? `${formatNumber(current.windSpeedKmh, 1)} km/h` : "Unavailable"}
                />
                <Metric
                  icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                  label="Model time"
                  value={formatPST(current.time)}
                />
                <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                  <span>Retrieved {formatPST(weather.fetchedAt)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", weather.stale ? "bg-amber-400" : "bg-emerald-400")} aria-hidden="true" />
                    {weather.stale ? "Stale data" : "Fresh from provider cache"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {weather?.stale ? (
          <Alert variant="warning" title="Showing stale weather data">
            {weather.staleReason ?? "The provider is unavailable."} Data was last retrieved{" "}
            {relativeTime(weather.fetchedAt)}. Do not treat it as current conditions.
          </Alert>
        ) : null}

        {state.loading && !weather ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48 md:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        ) : null}

        {weather && current && category ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="overflow-hidden">
                <div className="h-1.5 w-full bg-primary" aria-hidden="true" />
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Heat-risk interpretation
                      </p>
                      <CardTitle className="mt-1 text-xl">
                        {current.heatIndexC != null
                          ? `${category.label} · ${formatNumber(current.heatIndexC, 1)} °C estimated heat index`
                          : "Heat index unavailable"}
                      </CardTitle>
                    </div>
                    <RiskBadge category={category} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-600">{category.description}</p>
                  <div>
                    <h3 className="text-sm font-bold text-navy">What to do now</h3>
                    <ul className="mt-2 space-y-2 text-sm text-slate-700">
                      {category.guidance.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="rounded-lg bg-muted p-3 text-sm text-slate-700">
                    <strong>Sa madaling salita:</strong> {category.taglish}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/cool-places?locality=${locality.code}`}>
                        <MapPin className="h-4 w-4" aria-hidden="true" /> Find a cool place
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/map">Explore the heat map</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Official information and data limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-lg border border-border bg-muted/60 p-3">
                    <p className="font-semibold text-navy">Official PAGASA heat index</p>
                    <p className="mt-1 text-slate-600">
                      Not automatically ingested. SILONG PH does not present an estimate as an official reading.
                    </p>
                    <a
                      href={PAGASA_SOURCE.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      Check DOST-PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Provider</dt>
                      <dd className="text-right font-semibold">{weather.providerLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Data type</dt>
                      <dd className="text-right font-semibold">Model current conditions</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Spatial resolution</dt>
                      <dd className="max-w-[15rem] text-right font-semibold">Model grid point, not barangay-level</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Source</dt>
                      <dd className="text-right font-semibold">
                        <a href={weather.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          Open-Meteo
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <p className="text-xs leading-relaxed text-muted-foreground">{weather.resolutionNote}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{weather.heatIndexMethod}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Next 24 hours</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Model forecast · estimated heat index</p>
                    </div>
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Forecast
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ForecastChart hourly={weather.hourly} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7-day outlook</CardTitle>
                  <p className="text-xs text-muted-foreground">Daily extremes and forecast peak heat index</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {weather.daily.map((day) => (
                    <div
                      key={day.date}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <WeatherIconView icon={day.icon} className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-semibold">{formatDay(`${day.date}T12:00:00+08:00`)}</p>
                          <p className="text-xs text-muted-foreground">{day.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(day.temperatureMinC, 0)}–{formatNumber(day.temperatureMaxC, 0)} °C
                        </p>
                        <p className="text-sm font-bold text-orange-700">
                          HI {day.peakHeatIndexC != null ? `${formatNumber(day.peakHeatIndexC, 0)}°` : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                icon={<Info className="h-5 w-5" aria-hidden="true" />}
                title="What this reading is"
                body="Current conditions are model-interpolated data from Open-Meteo at the locality centre. The heat index is calculated by this application. Neither is a PAGASA station observation."
              />
              <InfoCard
                icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                title="Forecast versus observation"
                body="The 24-hour chart and 7-day outlook are forecasts. They are not measurements. Forecasts change; always check the latest official guidance."
              />
              <InfoCard
                icon={<Droplets className="h-5 w-5" aria-hidden="true" />}
                title="Heat index is not air temperature"
                body="The heat index combines temperature and humidity to describe how hot it feels. Shade, wind, activity, clothing, hydration, and health also affect risk."
              />
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-primary">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-navy">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
      </CardContent>
    </Card>
  );
}
