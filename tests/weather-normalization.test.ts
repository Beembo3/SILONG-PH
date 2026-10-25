import { describe, expect, it } from "vitest";
import { heatIndexCelsius } from "@/lib/heat-index";
import {
  normalizeOpenMeteo,
  WeatherUnavailableError,
  weatherCondition,
  type OpenMeteoPayload,
} from "@/lib/weather/open-meteo";

function buildPayload(): OpenMeteoPayload {
  const hourlyTimes = Array.from({ length: 48 }, (_, index) => {
    const hour = index % 24;
    const day = 25 + Math.floor(index / 24);
    return `2026-10-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00`;
  });

  return {
    latitude: 15.03,
    longitude: 120.69,
    elevation: 12,
    timezone: "Asia/Manila",
    current: {
      time: "2026-10-25T14:00",
      temperature_2m: 33,
      relative_humidity_2m: 70,
      apparent_temperature: 39,
      is_day: 1,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 8.5,
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTimes.map((_, index) => 30 + (index % 6)),
      relative_humidity_2m: hourlyTimes.map((_, index) => 60 + (index % 20)),
      apparent_temperature: hourlyTimes.map((_, index) => 36 + (index % 4)),
      precipitation_probability: hourlyTimes.map((_, index) => index % 100),
      weather_code: hourlyTimes.map((_, index) => (index % 3 === 0 ? 0 : 2)),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, index) => `2026-10-${String(25 + index).padStart(2, "0")}`),
      temperature_2m_max: [33, 34, 35, 33, 32, 31, 34],
      temperature_2m_min: [24, 25, 25, 24, 23, 23, 24],
      weather_code: [2, 3, 80, 95, 0, 1, 2],
      precipitation_probability_max: [40, 60, 80, 90, 10, 20, 30],
      sunrise: Array.from({ length: 7 }, (_, index) => `2026-10-${String(25 + index).padStart(2, "0")}T05:50`),
      sunset: Array.from({ length: 7 }, (_, index) => `2026-10-${String(25 + index).padStart(2, "0")}T17:35`),
    },
  };
}

describe("normalizeOpenMeteo", () => {
  it("normalises current, hourly, and daily model data", () => {
    const snapshot = normalizeOpenMeteo(
      buildPayload(),
      { latitude: 15, longitude: 120.5 },
      "2026-10-25T06:00:00.000Z",
    );

    expect(snapshot.provider).toBe("open-meteo");
    expect(snapshot.dataType).toBe("model-current");
    expect(snapshot.timezone).toBe("Asia/Manila");
    expect(snapshot.elevationM).toBe(12);
    expect(snapshot.fetchedAt).toBe("2026-10-25T06:00:00.000Z");
    expect(snapshot.stale).toBe(false);
    expect(snapshot.staleReason).toBeNull();
    expect(snapshot.cacheAgeSeconds).toBe(0);
    expect(snapshot.officialHeatIndex).toBeNull();
    expect(snapshot.officialHeatIndexNote).toContain("not ingested automatically");

    expect(snapshot.current.temperatureC).toBe(33);
    expect(snapshot.current.relativeHumidity).toBe(70);
    expect(snapshot.current.heatIndexC).toBe(heatIndexCelsius(33, 70));
    expect(snapshot.current.heatIndexCategory.level).toBe("danger");
    expect(snapshot.current.condition).toBe("Partly cloudy");
    expect(snapshot.current.icon).toBe("cloud-sun");
    expect(snapshot.current.isDay).toBe(true);
    expect(snapshot.current.windSpeedKmh).toBe(8.5);

    // The current hour is 14:00, so the 24-hour window starts there.
    expect(snapshot.hourly).toHaveLength(24);
    expect(snapshot.hourly[0]?.time).toBe("2026-10-25T14:00");
    expect(snapshot.hourly[23]?.time).toBe("2026-10-26T13:00");

    expect(snapshot.daily).toHaveLength(7);
    const firstDayHourlyPeak = Math.max(
      ...snapshot.hourly
        .filter((hour) => hour.time.startsWith("2026-10-25"))
        .map((hour) => hour.heatIndexC ?? Number.NEGATIVE_INFINITY),
    );
    expect(snapshot.daily[0]?.peakHeatIndexC).toBe(firstDayHourlyPeak);
    expect(snapshot.daily[0]?.peakHeatIndexCategory.level).toBe("extreme_danger");
    expect(snapshot.daily[0]?.sunrise).toBe("2026-10-25T05:50");
    expect(snapshot.daily[0]?.sunset).toBe("2026-10-25T17:35");
  });

  it("uses the fallback coordinates when the provider omits them", () => {
    const payload = buildPayload();
    delete payload.latitude;
    delete payload.longitude;
    const snapshot = normalizeOpenMeteo(payload, { latitude: 15.1, longitude: 120.7 });
    expect(snapshot.latitude).toBe(15.1);
    expect(snapshot.longitude).toBe(120.7);
  });

  it("keeps missing inputs null instead of inventing a reading", () => {
    const payload = buildPayload();
    payload.current = {
      ...payload.current,
      temperature_2m: null,
      relative_humidity_2m: null,
      weather_code: null,
    };
    const snapshot = normalizeOpenMeteo(payload, { latitude: 15, longitude: 120 });
    expect(snapshot.current.temperatureC).toBeNull();
    expect(snapshot.current.relativeHumidity).toBeNull();
    expect(snapshot.current.heatIndexC).toBeNull();
    expect(snapshot.current.heatIndexCategory.level).toBe("below_caution");
    expect(snapshot.current.condition).toBe("Condition unavailable");
  });

  it("throws when the provider response has no current block", () => {
    expect(() =>
      normalizeOpenMeteo({ hourly: {}, daily: {} }, { latitude: 15, longitude: 120 }),
    ).toThrow(WeatherUnavailableError);
  });

  it("handles missing hourly and daily arrays without fabricating data", () => {
    const payload = buildPayload();
    delete payload.hourly;
    delete payload.daily;
    const snapshot = normalizeOpenMeteo(payload, { latitude: 15, longitude: 120 });
    expect(snapshot.hourly).toEqual([]);
    expect(snapshot.daily).toEqual([]);
  });
});

describe("weatherCondition", () => {
  it.each([
    [0, "Clear sky", "sun"],
    [1, "Mainly clear", "sun"],
    [2, "Partly cloudy", "cloud-sun"],
    [3, "Overcast", "cloud"],
    [45, "Fog", "fog"],
    [51, "Drizzle", "drizzle"],
    [61, "Rain", "rain"],
    [80, "Rain showers", "showers"],
    [95, "Thunderstorm", "thunder"],
    [null, "Condition unavailable", "cloud"],
  ] as const)("maps WMO code %s to %s", (code, label, icon) => {
    expect(weatherCondition(code)).toEqual({ label, icon });
  });

  it("uses moon icons at night", () => {
    expect(weatherCondition(0, false)).toEqual({ label: "Clear sky", icon: "moon" });
    expect(weatherCondition(2, false)).toEqual({ label: "Partly cloudy", icon: "cloud-moon" });
  });
});
