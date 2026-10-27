import Link from "next/link";
import { ArrowRight, Droplets, ExternalLink, Info, Thermometer, Wind } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ForecastChart } from "@/components/weather/forecast-chart";
import { HeatMeter } from "@/components/weather/heat-meter";
import { RiskBadge } from "@/components/weather/risk-badge";
import { WeatherIconView } from "@/components/weather/weather-icon";
import { conditionLabel, formatDay, formatNumber, formatPST, relativeTime } from "@/lib/format";
import { PAGASA_SOURCE } from "@/lib/heat-index";
import { getWeather } from "@/lib/weather/open-meteo";

interface PointWeatherProps {
  latitude: number;
  longitude: number;
  label: string;
  context: string;
  /** Optional extra explanation shown under the current conditions. */
  note?: string;
}

/**
 * Server-rendered model weather for a province or locality page.
 * The heat index is always labelled as an application estimate.
 */
export async function PointWeather({ latitude, longitude, label, context, note }: PointWeatherProps) {
  let weather;
  try {
    weather = await getWeather(latitude, longitude);
  } catch (error) {
    console.error(`Weather unavailable for ${label}`, error);
    return (
      <Alert variant="warning" title={`Walang weather sa ngayon para sa ${label}`}>
        <p>
          Hindi maabot ang weather provider at walang recent snapshot. Walang gawa-gawang reading na ipinalit.
        </p>
        <p className="mt-2">
          Tingnan ang opisyal na{" "}
          <a
            href={PAGASA_SOURCE.url}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline"
          >
            heat-index page ng DOST-PAGASA
          </a>{" "}
          o ang lokal na pamahalaan para sa kasalukuyang payo.
        </p>
      </Alert>
    );
  }

  const current = weather.current;
  const category = current.heatIndexCategory;

  return (
    <section aria-labelledby="point-weather-heading" className="space-y-5">
      <div className="paper-panel overflow-hidden rounded-[1.8rem]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/75 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="eyebrow text-sun-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-sun" aria-hidden="true" /> Model conditions
            </p>
            <h2
              id="point-weather-heading"
              className="mt-1.5 font-display text-2xl font-bold tracking-[-0.04em] text-forest sm:text-3xl"
            >
              {label}
            </h2>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{context}</p>
          </div>
          <Badge variant={weather.stale ? "warning" : "success"}>
            {weather.stale ? "Luma ang snapshot" : "Bagong provider cache"}
          </Badge>
        </div>

        <div className="p-5 sm:p-6">
          {weather.stale ? (
            <Alert variant="warning" className="mb-5" title="Luma na ang weather data">
              {weather.staleReason ?? "Hindi available ang provider."} Huling nakuha {relativeTime(weather.fetchedAt)}.
              Huwag ituring na kasalukuyang kondisyon.
            </Alert>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.02fr_.98fr] lg:gap-8">
            <div className="relative overflow-hidden rounded-[1.4rem] bg-[#f8f1e3] px-3 py-3">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 sun-glow" />
              <div className="relative">
                <HeatMeter category={category} valueC={current.heatIndexC} />
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  <RiskBadge category={category} />
                  <span className="text-[11px] font-bold text-[#536258]">{category.taglishRangeLabel}</span>
                </div>
                <p className="mx-auto mt-2 max-w-sm text-center text-xs leading-6 text-[#536258]">
                  Estimate ng app mula sa temperature at relative humidity. Hindi official PAGASA reading.
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <WeatherIconView icon={current.icon} className="h-6 w-6 text-canopy" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
                      Kasalukuyang lagay
                    </p>
                    <p className="text-sm font-bold text-forest">{conditionLabel(current.condition)}</p>
                  </div>
                </div>
                <p className="text-right text-[11px] text-muted-foreground">
                  Model time
                  <span className="block font-bold text-forest">{formatPST(current.time)}</span>
                </p>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-5">
                <Metric
                  icon={<Thermometer className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Temperatura ng hangin"
                  value={current.temperatureC != null ? `${formatNumber(current.temperatureC, 1)} °C` : "Hindi available"}
                />
                <Metric
                  icon={<Droplets className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Halumigmig"
                  value={current.relativeHumidity != null ? `${current.relativeHumidity}%` : "Hindi available"}
                />
                <Metric
                  icon={<Thermometer className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Pakiramdam"
                  value={
                    current.apparentTemperatureC != null
                      ? `${formatNumber(current.apparentTemperatureC, 1)} °C`
                      : "Hindi available"
                  }
                />
                <Metric
                  icon={<Wind className="h-3.5 w-3.5" aria-hidden="true" />}
                  label="Hangin"
                  value={
                    current.windSpeedKmh != null
                      ? `${formatNumber(current.windSpeedKmh, 1)} km/h`
                      : "Hindi available"
                  }
                />
              </dl>

            </div>
          </div>

          <div className="mt-6 border-t border-border/70 pt-5">
            <h3 className="font-display text-base font-bold text-forest">Ano ang ibig sabihin ng category?</h3>
            <div className="mt-2 grid gap-4 sm:grid-cols-[1.15fr_.85fr]">
              <div>
                <p className="text-sm leading-7 text-[#3f5146]">{category.taglishDescription}</p>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#3f5146]">
                  {category.taglishGuidance.slice(0, 4).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-[#f8f3e9] p-4">
                <p className="text-xs leading-relaxed text-[#3f5146]">
                  <strong className="font-bold text-forest">Sa madaling salita:</strong> {category.taglish}
                </p>
                <div className="mt-3 flex flex-col gap-1 text-sm font-bold">
                  <Link
                    href={`/cool-places?lat=${latitude}&lon=${longitude}&sort=nearest`}
                    className="inline-flex min-h-11 items-center gap-1 text-primary"
                  >
                    Humanap ng pasilidad sa malapit <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href={PAGASA_SOURCE.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-[#536258] hover:text-primary"
                  >
                    Opisyal na PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 flex items-start gap-2 border-t border-border/70 pt-4 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
            <span>
              {note ?? "Model-interpolated data ito para sa coordinate na ito, hindi station measurement."} Nakuha{" "}
              {formatPST(weather.fetchedAt)}.
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_.6fr]">
        <div className="min-w-0 paper-panel rounded-[1.7rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow text-sun-ink">Forecast</p>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-[-0.03em] text-forest">Susunod na 24 oras</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Model forecast · estimated heat index</p>
            </div>
            <Badge variant="outline">Model data</Badge>
          </div>
          <div className="mt-4">
            <ForecastChart hourly={weather.hourly} />
          </div>
        </div>

        <div className="paper-panel rounded-[1.7rem] p-5 sm:p-6">
          <p className="eyebrow text-sun-ink">Mas matagal</p>
          <h3 className="mt-1.5 font-display text-xl font-bold tracking-[-0.03em] text-forest">7 araw na tanaw</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Daily extremes at peak heat index</p>
          <div className="mt-4 divide-y divide-border/60">
            {weather.daily.length === 0 ? (
              <p className="text-sm text-muted-foreground">Walang daily forecast value na naibalik ang provider.</p>
            ) : (
              weather.daily.map((day) => (
                <div key={day.date} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <WeatherIconView icon={day.icon} className="h-5 w-5 text-canopy" />
                    <div>
                      <p className="text-sm font-bold text-forest">{formatDay(`${day.date}T12:00:00+08:00`)}</p>
                      <p className="text-xs text-muted-foreground">{conditionLabel(day.condition)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">
                      {formatNumber(day.temperatureMinC, 0)}–{formatNumber(day.temperatureMaxC, 0)} °C
                    </p>
                    <p className="text-sm font-bold text-sun-ink">
                      HI {day.peakHeatIndexC != null ? `${formatNumber(day.peakHeatIndexC, 0)}°` : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-border/80 bg-[#f8f3e9] p-4 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-canopy" aria-hidden="true" />
        <p>
          Model-interpolated data mula sa Open-Meteo ang kasalukuyang kondisyon at forecast sa napiling coordinate.
          Hindi ito station measurement, barangay-level reading, o official PAGASA observation. Kinukuwenta ng SILONG PH
          ang heat index. Source:{" "}
          <a href={weather.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">
            Open-Meteo
          </a>
          .
        </p>
      </div>
    </section>
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
    <div className="border-b border-border/60 py-2.5">
      <dt className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold text-forest">{value}</dd>
    </div>
  );
}
