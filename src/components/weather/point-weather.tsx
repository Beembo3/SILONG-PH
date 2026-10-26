import Link from "next/link";
import { Clock, Droplets, ExternalLink, Info, Thermometer, Wind } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForecastChart } from "@/components/weather/forecast-chart";
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
            className="font-semibold underline"
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
    <section aria-labelledby="point-weather-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Model conditions</p>
          <h2 id="point-weather-heading" className="mt-1 text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
            {label}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{context}</p>
        </div>
        <Badge variant={weather.stale ? "warning" : "success"}>
          {weather.stale ? "Luma ang snapshot" : "Bagong provider cache"}
        </Badge>
      </div>

      {weather.stale ? (
        <Alert variant="warning" title="Luma na ang weather data">
          {weather.staleReason ?? "Hindi available ang provider."} Huling nakuha {relativeTime(weather.fetchedAt)}.
          Huwag ituring na kasalukuyang kondisyon.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tinatayang heat index
                </p>
                <p className="numeric mt-1 text-4xl font-extrabold text-navy sm:text-5xl">
                  {current.heatIndexC != null ? formatNumber(current.heatIndexC, 1) : "—"}
                  <span className="ml-1 align-top text-lg text-muted-foreground">°C</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimate ng app mula sa temperature at relative humidity. Hindi official PAGASA reading.
                </p>
              </div>
              <div className="text-right">
                <WeatherIconView icon={current.icon} className="ml-auto h-9 w-9 text-slate-500" />
                <p className="mt-1 text-sm font-semibold text-slate-700">{conditionLabel(current.condition)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <RiskBadge category={category} />
              <span className="text-sm font-semibold text-slate-600">
                Temperatura ng hangin{" "}
                {current.temperatureC != null ? `${formatNumber(current.temperatureC, 1)} °C` : "hindi available"}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Metric
                icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
                label="Halumigmig"
                value={current.relativeHumidity != null ? `${current.relativeHumidity}%` : "Hindi available"}
              />
              <Metric
                icon={<Thermometer className="h-4 w-4" aria-hidden="true" />}
                label="Pakiramdam"
                value={
                  current.apparentTemperatureC != null
                    ? `${formatNumber(current.apparentTemperatureC, 1)} °C`
                    : "Hindi available"
                }
              />
              <Metric
                icon={<Wind className="h-4 w-4" aria-hidden="true" />}
                label="Hangin"
                value={
                  current.windSpeedKmh != null
                    ? `${formatNumber(current.windSpeedKmh, 1)} km/h`
                    : "Hindi available"
                }
              />
              <Metric
                icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                label="Oras ng model"
                value={formatPST(current.time)}
              />
            </dl>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {note ?? "Model-interpolated data ito para sa coordinate na ito, hindi station measurement."} Nakuha{" "}
              {formatPST(weather.fetchedAt)}.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ano ang ibig sabihin ng category?</CardTitle>
            <p className="text-xs text-muted-foreground">{category.taglishRangeLabel}</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="leading-relaxed text-slate-600">{category.taglishDescription}</p>
            <ul className="space-y-2 text-slate-700">
              {category.taglishGuidance.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-muted p-3 text-xs leading-relaxed text-slate-700">
              <strong>Sa madaling salita:</strong> {category.taglish}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href={`/cool-places?lat=${latitude}&lon=${longitude}&sort=nearest`}
                className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline"
              >
                Humanap ng pasilidad sa malapit
              </Link>
              <a
                href={PAGASA_SOURCE.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-slate-600 hover:underline"
              >
                Opisyal na PAGASA <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Susunod na 24 oras</CardTitle>
            <p className="text-xs text-muted-foreground">Model forecast · estimated heat index</p>
          </CardHeader>
          <CardContent>
            <ForecastChart hourly={weather.hourly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7 araw na tanaw</CardTitle>
            <p className="text-xs text-muted-foreground">Daily extremes at peak heat index</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {weather.daily.length === 0 ? (
              <p className="text-sm text-muted-foreground">Walang daily forecast value na naibalik ang provider.</p>
            ) : (
              weather.daily.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <WeatherIconView icon={day.icon} className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold">{formatDay(`${day.date}T12:00:00+08:00`)}</p>
                      <p className="text-xs text-muted-foreground">{conditionLabel(day.condition)}</p>
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
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Model-interpolated data mula sa Open-Meteo ang kasalukuyang kondisyon at forecast sa napiling coordinate.
          Hindi ito station measurement, barangay-level reading, o official PAGASA observation. Kinukuwenta ng SILONG PH
          ang heat index. Source:{" "}
          <a href={weather.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold underline">
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
    <div className="rounded-lg border border-border bg-muted/40 p-2.5">
      <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-xs font-bold text-slate-800">{value}</dd>
    </div>
  );
}
