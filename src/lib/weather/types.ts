import type { HeatRiskCategory } from "@/lib/heat-index";

export interface WeatherPoint {
  id?: string;
  name?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  time: string;
  temperatureC: number | null;
  relativeHumidity: number | null;
  apparentTemperatureC: number | null;
  heatIndexC: number | null;
  heatIndexCategory: HeatRiskCategory;
  weatherCode: number | null;
  condition: string;
  icon: WeatherIcon;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  isDay: boolean | null;
}

export interface HourlyWeather {
  time: string;
  temperatureC: number | null;
  relativeHumidity: number | null;
  apparentTemperatureC: number | null;
  heatIndexC: number | null;
  heatIndexCategory: HeatRiskCategory;
  precipitationProbability: number | null;
  weatherCode: number | null;
  condition: string;
  icon: WeatherIcon;
}

export interface DailyWeather {
  date: string;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  peakHeatIndexC: number | null;
  peakHeatIndexCategory: HeatRiskCategory;
  precipitationProbabilityMax: number | null;
  weatherCode: number | null;
  condition: string;
  icon: WeatherIcon;
  sunrise: string | null;
  sunset: string | null;
}

export type WeatherIcon =
  | "sun"
  | "moon"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers"
  | "thunder"
  | "snow";

export interface WeatherSnapshot {
  provider: "open-meteo";
  providerLabel: string;
  latitude: number;
  longitude: number;
  elevationM: number | null;
  timezone: string;
  fetchedAt: string;
  dataType: "model-current";
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  stale: boolean;
  staleReason: string | null;
  cacheAgeSeconds: number;
  sourceUrl: string;
  attribution: string;
  licenseUrl: string;
  resolutionNote: string;
  officialHeatIndex: null;
  officialHeatIndexNote: string;
  heatIndexMethod: string;
}

export interface RegionWeatherResult {
  points: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    snapshot: WeatherSnapshot;
  }>;
  failed: Array<{ id: string; name: string; error: string }>;
  fetchedAt: string;
  stale: boolean;
}
