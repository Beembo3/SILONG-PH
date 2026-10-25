"use client";

import { formatDay, formatPSTTime } from "@/lib/format";
import type { HourlyWeather } from "@/lib/weather/types";

export function ForecastChart({ hourly }: { hourly: HourlyWeather[] }) {
  const points = hourly.filter((h) => h.heatIndexC != null && h.temperatureC != null);
  if (points.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        A 24-hour forecast chart is not available because the provider did not return enough
        complete temperature and humidity values.
      </div>
    );
  }

  const width = 800;
  const height = 260;
  const padding = { top: 22, right: 18, bottom: 42, left: 42 };
  const values = points.flatMap((p) => [p.heatIndexC as number, p.temperatureC as number]);
  const min = Math.floor(Math.min(...values) - 2);
  const max = Math.ceil(Math.max(...values) + 2);
  const x = (index: number) =>
    padding.left + (index / (points.length - 1)) * (width - padding.left - padding.right);
  const y = (value: number) =>
    padding.top + ((max - value) / (max - min)) * (height - padding.top - padding.bottom);

  const line = (get: (p: HourlyWeather) => number) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(get(p)).toFixed(1)}`).join(" ");

  const heatPath = line((p) => p.heatIndexC as number);
  const tempPath = line((p) => p.temperatureC as number);
  const areaPath = `${heatPath} L ${x(points.length - 1)} ${height - padding.bottom} L ${x(0)} ${
    height - padding.bottom
  } Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => min + ((max - min) / 4) * i);
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" aria-hidden="true" />
          Estimated heat index
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-600" aria-hidden="true" />
          Air temperature
        </span>
        <span className="text-muted-foreground">°C · next 24 hours · Asia/Manila</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-labelledby="forecast-chart-title forecast-chart-desc"
      >
        <title id="forecast-chart-title">24-hour temperature and estimated heat-index forecast</title>
        <desc id="forecast-chart-desc">
          Line chart from {formatPSTTime(points[0].time)} to{" "}
          {formatPSTTime(points[points.length - 1].time)}. The estimated heat index peaks at{" "}
          {Math.max(...points.map((p) => p.heatIndexC as number)).toFixed(1)} degrees Celsius.
        </desc>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={padding.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#667085">
              {Math.round(tick)}°
            </text>
          </g>
        ))}
        <path d={areaPath} fill="#ff7a1a" opacity="0.08" />
        <path d={heatPath} fill="none" stroke="#ff7a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d={tempPath} fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
        {points.map((point, index) => {
          if (index % labelEvery !== 0 && index !== points.length - 1) return null;
          return (
            <g key={point.time}>
              <text
                x={x(index)}
                y={height - 16}
                textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}
                fontSize="11"
                fill="#667085"
              >
                {formatPSTTime(point.time)}
              </text>
            </g>
          );
        })}
        {points.map((point, index) =>
          index === 0 || index === points.length - 1 ? (
            <circle
              key={`dot-${point.time}`}
              cx={x(index)}
              cy={y(point.heatIndexC as number)}
              r="4"
              fill="#fff"
              stroke="#ff7a1a"
              strokeWidth="3"
            />
          ) : null,
        )}
      </svg>

      <details className="mt-3 rounded-lg border border-border bg-muted/50 p-3 text-sm">
        <summary className="cursor-pointer font-semibold text-navy">View hourly data as a table</summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-semibold">Time</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Temp (°C)</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Humidity</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Heat index (°C)</th>
                <th scope="col" className="py-2 font-semibold">Condition</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.time} className="border-b border-border/60">
                  <td className="py-2 pr-3">{formatDay(point.time)} {formatPSTTime(point.time)}</td>
                  <td className="py-2 pr-3">{point.temperatureC?.toFixed(1)}</td>
                  <td className="py-2 pr-3">{point.relativeHumidity ?? "—"}%</td>
                  <td className="py-2 pr-3 font-semibold">{point.heatIndexC?.toFixed(1)}</td>
                  <td className="py-2">{point.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
