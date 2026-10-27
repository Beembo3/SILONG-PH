"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw, ShieldAlert, Sun } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

  const notices =
    data?.provinces.filter(
      (province) =>
        province.weather?.current.heatIndexC != null &&
        NOTICE_LEVELS.has(province.weather.current.heatIndexCategory.level),
    ) ?? [];

  return (
    <section aria-labelledby="heat-notices-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow text-sun-ink">
            <span className="h-px w-5 bg-sun-ink" aria-hidden="true" /> Heat notice ng app
          </p>
          <h2
            id="heat-notices-heading"
            className="mt-2 font-display text-[clamp(1.55rem,3vw,2.2rem)] font-bold leading-[1.05] tracking-[-0.04em] text-forest"
          >
            Kasalukuyang heat notice
          </h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Kinukuwenta ng SILONG PH ang mga notice na ito mula sa estimated heat index sa model point ng bawat
            probinsya. <strong className="font-bold text-forest">Hindi ito official advisory</strong> at hindi kapalit ng
            payo ng PAGASA, DOH, NDRRMC, o LGU.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={retry} disabled={loading}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> I-refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="warning" className="mt-4" title="Hindi available ang heat notices">
          {error} Walang gawa-gawang notice na ipinalit. Tingnan ang official sources sa ibaba.
        </Alert>
      ) : null}

      {loading && !data ? (
        <div className="mt-5 space-y-2" aria-busy="true" aria-label="Kinukuha ang heat notices">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : null}

      {data ? (
        <>
          {notices.length === 0 ? (
            <div className="mt-5 flex gap-4 rounded-[1.5rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef0e9] text-[#64736a]">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-snug text-forest">
                  Walang province model point na nasa Extreme Caution o mas mataas sa ngayon
                </p>
                <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
                  Base ito sa pinakabagong model data, hindi garantiya na ligtas ang lahat ng lugar. Puwedeng mas
                  mainit sa aktwal na lokasyon, lalo na sa matataong urban area at direktang araw.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#e4c792] bg-[#fffaf0] shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2.5 border-b border-[#e4c792]/70 px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7a4300]">
                <Sun className="h-4 w-4" aria-hidden="true" /> Gawa ng app · hindi official warning
              </div>
              <div className="divide-y divide-[#e4c792]/60">
                {notices.map((province) => {
                  const current = province.weather?.current;
                  if (!current) return null;
                  return (
                    <div key={province.code} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold tracking-[-0.025em] text-forest">{province.name}</h3>
                          <RiskBadge category={current.heatIndexCategory} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Model point: {province.capitalName}</p>
                        <p className="mt-2 text-sm leading-7 text-[#4e6154]">
                          Tinatayang heat index{" "}
                          <strong className="font-bold text-forest">
                            {current.heatIndexC != null ? `${current.heatIndexC.toFixed(1)} °C` : "hindi available"}
                          </strong>
                          . {current.heatIndexCategory.taglishDescription}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold">
                          <Link href={`/provinces/${province.slug}`} className="inline-flex min-h-11 items-center text-primary">
                            Detalye ng probinsya <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          <Link href="/preparedness" className="inline-flex min-h-11 items-center text-[#536258]">
                            Ano ang dapat gawin
                          </Link>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="numeric font-display text-3xl font-bold tracking-[-0.04em] text-forest">
                          {current.heatIndexC != null ? current.heatIndexC.toFixed(1) : "—"}
                          <span className="ml-0.5 text-sm font-bold text-muted-foreground">°C</span>
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">estimate</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sun-ink" aria-hidden="true" />
            Nakuha {formatPST(data.fetchedAt)}. {data.stale ? "Luma na ang regional snapshot. " : ""}
            {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
