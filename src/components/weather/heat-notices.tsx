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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Heat notice ng app</p>
          <h2 id="heat-notices-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            Kasalukuyang heat notice
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Kinukuwenta ng SILONG PH ang mga notice na ito mula sa estimated heat index sa model point ng bawat
            probinsya. <strong>Hindi ito official advisory</strong> at hindi kapalit ng payo ng PAGASA, DOH, NDRRMC, o
            LGU.
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
                    Walang province model point na nasa Extreme Caution o mas mataas sa ngayon
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Base ito sa pinakabagong model data, hindi garantiya na ligtas ang lahat ng lugar. Puwedeng mas
                    mainit sa aktwal na lokasyon, lalo na sa matataong urban area at direktang araw.
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
                            Heat notice ng app · hindi official
                          </p>
                          <h3 className="mt-1 text-base font-bold text-navy">{province.name}</h3>
                          <p className="text-xs text-muted-foreground">Model point: {province.capitalName}</p>
                        </div>
                        <RiskBadge category={current.heatIndexCategory} />
                      </div>
                      <p className="mt-3 text-sm text-slate-700">
                        Tinatayang heat index{" "}
                        <strong>{current.heatIndexC != null ? `${current.heatIndexC.toFixed(1)} °C` : "hindi available"}</strong>
                        . {current.heatIndexCategory.taglishDescription}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                        <Link href={`/provinces/${province.slug}`} className="inline-flex min-h-11 items-center text-primary hover:underline">
                          Detalye ng probinsya
                        </Link>
                        <Link href="/preparedness" className="inline-flex min-h-11 items-center text-slate-600 hover:underline">
                          Ano ang dapat gawin
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
            Nakuha {formatPST(data.fetchedAt)}. {data.stale ? "Luma na ang regional snapshot. " : ""}
            {data.note}
          </p>
        </>
      ) : null}
    </section>
  );
}
