import {
  classifyHeatIndex,
  heatIndexCelsius,
  PAGASA_SOURCE,
} from "@/lib/heat-index";
import { TimedCache } from "./cache";
import { redisGetJson, redisSetJson } from "@/lib/redis";
import type {
  DailyWeather,
  HourlyWeather,
  RegionWeatherResult,
  WeatherIcon,
  WeatherPoint,
  WeatherSnapshot,
} from "./types";

const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_STALE_MS = 3 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 9_000;
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const SOURCE_URL = "https://open-meteo.com/";
const LICENSE_URL = "https://open-meteo.com/en/license";
const ATTRIBUTION =
  "Weather data by Open-Meteo.com, derived from national weather service models. Heat index is calculated by SILONG PH.";
const RESOLUTION_NOTE =
  "Open-Meteo provides model grid data interpolated to the selected coordinate (typically several kilometres). It is not a barangay-level measurement or an official PAGASA station reading.";

const weatherCache = new TimedCache<WeatherSnapshot>(CACHE_TTL_MS, 300);
const regionCache = new TimedCache<RegionWeatherResult>(CACHE_TTL_MS, 40);

const REDIS_FRESH_SECONDS = Math.round(CACHE_TTL_MS / 1000);
const REDIS_STALE_SECONDS = Math.round(MAX_STALE_MS / 1000);

function sharedKey(kind: "fresh" | "stale", key: string): string {
  return `silong:weather:${kind}:${key}`;
}

function staleWeather(snapshot: WeatherSnapshot, ageMs: number): WeatherSnapshot {
  return {
    ...snapshot,
    stale: true,
    staleReason: `Hindi maabot ang weather provider. Ipinapakita ang huling successful reading mula ${Math.round(
      ageMs / 60000,
    )} minuto ang nakalipas.`,
    cacheAgeSeconds: Math.round(ageMs / 1000),
  };
}

export class WeatherUnavailableError extends Error {
  constructor(
    message: string,
    public readonly causeCode: "timeout" | "network" | "provider" | "invalid" = "provider",
  ) {
    super(message);
    this.name = "WeatherUnavailableError";
  }
}

function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function cacheKey(lat: number, lon: number): string {
  return `${roundCoord(lat)},${roundCoord(lon)}`;
}

export function weatherCondition(code: number | null, isDay = true): { label: string; icon: WeatherIcon } {
  if (code == null) return { label: "Condition unavailable", icon: "cloud" };
  if (code === 0) return { label: "Clear sky", icon: isDay ? "sun" : "moon" };
  if (code === 1) return { label: "Mainly clear", icon: isDay ? "sun" : "moon" };
  if (code === 2) return { label: "Partly cloudy", icon: isDay ? "cloud-sun" : "cloud-moon" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 55) return { label: "Drizzle", icon: "drizzle" };
  if (code === 56 || code === 57) return { label: "Freezing drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 65) return { label: "Rain", icon: "rain" };
  if (code === 66 || code === 67) return { label: "Freezing rain", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: "showers" };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: "snow" };
  if (code >= 95) return { label: "Thunderstorm", icon: "thunder" };
  return { label: "Mixed conditions", icon: "cloud" };
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildUrl(latitudes: number[], longitudes: number[]): string {
  const params = new URLSearchParams({
    latitude: latitudes.map((v) => v.toFixed(5)).join(","),
    longitude: longitudes.map((v) => v.toFixed(5)).join(","),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_probability_max",
    timezone: "Asia/Manila",
    forecast_days: "7",
  });
  return `${BASE_URL}?${params.toString()}`;
}

export interface OpenMeteoPayload {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  current?: Record<string, unknown>;
  hourly?: Record<string, unknown>;
  daily?: Record<string, unknown>;
}

function toNumberArray(value: unknown): Array<number | null> {
  if (!Array.isArray(value)) return [];
  return value.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : null));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export function normalizeOpenMeteo(
  payload: OpenMeteoPayload,
  fallbackPoint: { latitude: number; longitude: number },
  fetchedAt = new Date().toISOString(),
): WeatherSnapshot {
  const current = payload.current;
  if (!current) throw new WeatherUnavailableError("Provider response is missing current conditions", "invalid");

  const currentTemp = numberOrNull(current.temperature_2m);
  const currentRh = numberOrNull(current.relative_humidity_2m);
  const currentHi =
    currentTemp != null && currentRh != null ? heatIndexCelsius(currentTemp, currentRh) : null;
  const currentIsDay = typeof current.is_day === "number" ? current.is_day === 1 : null;
  const currentCondition = weatherCondition(
    numberOrNull(current.weather_code),
    currentIsDay !== false,
  );

  const hourlyTimes = toStringArray(payload.hourly?.time);
  const hourlyTemps = toNumberArray(payload.hourly?.temperature_2m);
  const hourlyRh = toNumberArray(payload.hourly?.relative_humidity_2m);
  const hourlyApparent = toNumberArray(payload.hourly?.apparent_temperature);
  const hourlyPop = toNumberArray(payload.hourly?.precipitation_probability);
  const hourlyCode = toNumberArray(payload.hourly?.weather_code);

  const currentHour = String(current.time ?? "").slice(0, 13);
  const startIndex = Math.max(
    0,
    hourlyTimes.findIndex((time) => time.slice(0, 13) >= currentHour),
  );
  const hourly: HourlyWeather[] = hourlyTimes
    .slice(startIndex, startIndex + 24)
    .map((time, offset) => {
      const i = startIndex + offset;
      const temp = hourlyTemps[i] ?? null;
      const rh = hourlyRh[i] ?? null;
      const hi = temp != null && rh != null ? heatIndexCelsius(temp, rh) : null;
      const condition = weatherCondition(hourlyCode[i] ?? null, true);
      return {
        time,
        temperatureC: temp,
        relativeHumidity: rh,
        apparentTemperatureC: hourlyApparent[i] ?? null,
        heatIndexC: hi,
        heatIndexCategory: classifyHeatIndex(hi),
        precipitationProbability: hourlyPop[i] ?? null,
        weatherCode: hourlyCode[i] ?? null,
        condition: condition.label,
        icon: condition.icon,
      };
    });

  const dailyTimes = toStringArray(payload.daily?.time);
  const dailyMax = toNumberArray(payload.daily?.temperature_2m_max);
  const dailyMin = toNumberArray(payload.daily?.temperature_2m_min);
  const dailyCode = toNumberArray(payload.daily?.weather_code);
  const dailyPop = toNumberArray(payload.daily?.precipitation_probability_max);
  const sunrise = toStringArray(payload.daily?.sunrise);
  const sunset = toStringArray(payload.daily?.sunset);

  const daily: DailyWeather[] = dailyTimes.map((date, i) => {
    const sameDay = hourly.filter((h) => h.time.slice(0, 10) === date);
    const peak = sameDay.reduce<number | null>(
      (max, h) => (h.heatIndexC != null && (max == null || h.heatIndexC > max) ? h.heatIndexC : max),
      null,
    );
    const condition = weatherCondition(dailyCode[i] ?? null, true);
    return {
      date,
      temperatureMaxC: dailyMax[i] ?? null,
      temperatureMinC: dailyMin[i] ?? null,
      peakHeatIndexC: peak,
      peakHeatIndexCategory: classifyHeatIndex(peak),
      precipitationProbabilityMax: dailyPop[i] ?? null,
      weatherCode: dailyCode[i] ?? null,
      condition: condition.label,
      icon: condition.icon,
      sunrise: sunrise[i] ?? null,
      sunset: sunset[i] ?? null,
    };
  });

  return {
    provider: "open-meteo",
    providerLabel: "Open-Meteo",
    latitude: payload.latitude ?? fallbackPoint.latitude,
    longitude: payload.longitude ?? fallbackPoint.longitude,
    elevationM: numberOrNull(payload.elevation),
    timezone: payload.timezone ?? "Asia/Manila",
    fetchedAt,
    dataType: "model-current",
    current: {
      time: String(current.time ?? fetchedAt),
      temperatureC: currentTemp,
      relativeHumidity: currentRh,
      apparentTemperatureC: numberOrNull(current.apparent_temperature),
      heatIndexC: currentHi,
      heatIndexCategory: classifyHeatIndex(currentHi),
      weatherCode: numberOrNull(current.weather_code),
      condition: currentCondition.label,
      icon: currentCondition.icon,
      windSpeedKmh: numberOrNull(current.wind_speed_10m),
      precipitationMm: numberOrNull(current.precipitation),
      isDay: currentIsDay,
    },
    hourly,
    daily,
    stale: false,
    staleReason: null,
    cacheAgeSeconds: 0,
    sourceUrl: SOURCE_URL,
    attribution: ATTRIBUTION,
    licenseUrl: LICENSE_URL,
    resolutionNote: RESOLUTION_NOTE,
    officialHeatIndex: null,
    officialHeatIndexNote: `Official PAGASA heat-index values are not ingested automatically. Check the official DOST-PAGASA page: ${PAGASA_SOURCE.url}`,
    heatIndexMethod:
      "Estimated with the US NWS/Rothfusz regression and documented adjustments, using Open-Meteo temperature and relative humidity. Rounded to 0.1 °C. This is not an official PAGASA reading.",
  };
}

async function fetchPayload(points: WeatherPoint[]): Promise<OpenMeteoPayload | OpenMeteoPayload[]> {
  let response: Response;
  try {
    response = await fetch(buildUrl(points.map((p) => p.latitude), points.map((p) => p.longitude)), {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
  } catch (error) {
    const isTimeout =
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new WeatherUnavailableError(
      isTimeout ? "Weather provider timed out." : "Could not reach the weather provider.",
      isTimeout ? "timeout" : "network",
    );
  }
  if (!response.ok) {
    throw new WeatherUnavailableError(
      `Weather provider returned HTTP ${response.status}.`,
      "provider",
    );
  }
  try {
    return (await response.json()) as OpenMeteoPayload | OpenMeteoPayload[];
  } catch {
    throw new WeatherUnavailableError("Weather provider returned an unreadable response.", "invalid");
  }
}

export async function getWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new WeatherUnavailableError("Invalid coordinates.", "invalid");
  }
  const key = cacheKey(lat, lon);
  const fresh = weatherCache.getFresh(key);
  if (fresh) return fresh;

  const sharedFresh = await redisGetJson<WeatherSnapshot>(sharedKey("fresh", key));
  if (sharedFresh) {
    weatherCache.set(key, sharedFresh);
    return sharedFresh;
  }

  const fetchedAt = new Date().toISOString();
  try {
    const payload = await fetchPayload([{ latitude: lat, longitude: lon }]);
    const item = Array.isArray(payload) ? payload[0] : payload;
    const snapshot = normalizeOpenMeteo(item, { latitude: lat, longitude: lon }, fetchedAt);
    weatherCache.set(key, snapshot);
    await Promise.all([
      redisSetJson(sharedKey("fresh", key), snapshot, REDIS_FRESH_SECONDS),
      redisSetJson(sharedKey("stale", key), snapshot, REDIS_STALE_SECONDS),
    ]);
    return snapshot;
  } catch (error) {
    const stale = weatherCache.getStale(key, MAX_STALE_MS);
    if (stale) {
      return staleWeather(stale.value, stale.ageMs);
    }
    const sharedStale = await redisGetJson<WeatherSnapshot>(sharedKey("stale", key));
    if (sharedStale) {
      const ageMs = Date.now() - Date.parse(sharedStale.fetchedAt);
      if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= MAX_STALE_MS) {
        weatherCache.set(key, sharedStale);
        return staleWeather(sharedStale, ageMs);
      }
    }
    throw error;
  }
}

export async function getRegionWeather(points: WeatherPoint[]): Promise<RegionWeatherResult> {
  if (points.length === 0) {
    return { points: [], failed: [], fetchedAt: new Date().toISOString(), stale: false };
  }
  const key = points
    .map((p) => `${p.id ?? ""}:${cacheKey(p.latitude, p.longitude)}`)
    .sort()
    .join("|");
  const fresh = regionCache.getFresh(key);
  if (fresh) return fresh;

  const sharedFresh = await redisGetJson<RegionWeatherResult>(sharedKey("fresh", `region:${key}`));
  if (sharedFresh) {
    regionCache.set(key, sharedFresh);
    return sharedFresh;
  }

  const fetchedAt = new Date().toISOString();
  try {
    const payload = await fetchPayload(points);
    const items = Array.isArray(payload) ? payload : [payload];
    const resultPoints = points.map((point, index) => {
      const item = items[index] ?? items[0];
      const snapshot = normalizeOpenMeteo(
        item,
        { latitude: point.latitude, longitude: point.longitude },
        fetchedAt,
      );
      weatherCache.set(cacheKey(point.latitude, point.longitude), snapshot);
      return {
        id: point.id ?? String(index),
        name: point.name ?? `Point ${index + 1}`,
        latitude: point.latitude,
        longitude: point.longitude,
        snapshot,
      };
    });
    const result: RegionWeatherResult = {
      points: resultPoints,
      failed: [],
      fetchedAt,
      stale: false,
    };
    regionCache.set(key, result);
    await Promise.all([
      redisSetJson(sharedKey("fresh", `region:${key}`), result, REDIS_FRESH_SECONDS),
      redisSetJson(sharedKey("stale", `region:${key}`), result, REDIS_STALE_SECONDS),
    ]);
    return result;
  } catch (error) {
    const stale = regionCache.getStale(key, MAX_STALE_MS);
    if (stale) {
      return {
        ...stale.value,
        stale: true,
        fetchedAt: stale.value.fetchedAt,
      };
    }
    const sharedStale = await redisGetJson<RegionWeatherResult>(
      sharedKey("stale", `region:${key}`),
    );
    if (sharedStale) {
      const ageMs = Date.now() - Date.parse(sharedStale.fetchedAt);
      if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= MAX_STALE_MS) {
        regionCache.set(key, sharedStale);
        return { ...sharedStale, stale: true };
      }
    }
    throw error;
  }
}

export function clearWeatherCache(): void {
  weatherCache.clear();
  regionCache.clear();
}
