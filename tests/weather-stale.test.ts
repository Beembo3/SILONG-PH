import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimedCache } from "@/lib/weather/cache";
import { clearWeatherCache, getWeather, WeatherUnavailableError } from "@/lib/weather/open-meteo";

const payload = {
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
  hourly: {},
  daily: {},
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("TimedCache", () => {
  it("serves fresh entries only within the TTL", () => {
    const cache = new TimedCache<string>(1_000);
    cache.set("a", "value", 1_000);
    expect(cache.getFresh("a", 1_500)).toBe("value");
    expect(cache.getFresh("a", 2_001)).toBeNull();
  });

  it("serves stale entries within the stale window and reports age", () => {
    const cache = new TimedCache<string>(1_000);
    cache.set("a", "value", 1_000);
    expect(cache.getStale("a", 5_000, 3_000)).toEqual({ value: "value", ageMs: 2_000 });
    expect(cache.getStale("a", 1_000, 3_000)).toBeNull();
  });

  it("evicts the oldest entry when full", () => {
    const cache = new TimedCache<string>(60_000, 2);
    cache.set("a", "one", 1_000);
    cache.set("b", "two", 2_000);
    cache.set("c", "three", 3_000);
    expect(cache.size).toBe(2);
    expect(cache.getFresh("a", 3_000)).toBeNull();
    expect(cache.getFresh("b", 3_000)).toBe("two");
    expect(cache.getFresh("c", 3_000)).toBe("three");
  });

  it("supports delete and clear", () => {
    const cache = new TimedCache<string>(60_000);
    cache.set("a", "one");
    cache.delete("a");
    expect(cache.getFresh("a")).toBeNull();
    cache.set("b", "two");
    cache.clear();
    expect(cache.size).toBe(0);
  });
});

describe("getWeather stale-data handling", () => {
  beforeEach(() => {
    clearWeatherCache();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T06:00:00.000Z"));
  });

  afterEach(() => {
    clearWeatherCache();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("returns a fresh snapshot and reuses the 10-minute cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    const first = await getWeather(15.03, 120.69);
    expect(first.stale).toBe(false);
    expect(first.current.heatIndexC).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-10-25T06:05:00.000Z"));
    const second = await getWeather(15.03, 120.69);
    expect(second.stale).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns the last successful snapshot with a stale warning when the provider fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    const fresh = await getWeather(15.03, 120.69);
    expect(fresh.stale).toBe(false);

    vi.setSystemTime(new Date("2026-10-25T06:11:00.000Z"));
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const stale = await getWeather(15.03, 120.69);
    expect(stale.stale).toBe(true);
    expect(stale.staleReason).toContain("Could not reach the weather provider.");
    expect(stale.staleReason).toContain("11 minutes ago");
    expect(stale.cacheAgeSeconds).toBe(11 * 60);
    expect(stale.fetchedAt).toBe(fresh.fetchedAt);
    expect(stale.current.heatIndexC).toBe(fresh.current.heatIndexC);
  });

  it("refuses to serve a snapshot older than three hours", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal("fetch", fetchMock);

    await getWeather(15.03, 120.69);

    vi.setSystemTime(new Date("2026-10-25T10:11:00.000Z"));
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(getWeather(15.03, 120.69)).rejects.toBeInstanceOf(WeatherUnavailableError);
  });

  it("wraps provider HTTP errors and never invents a reading", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: true }, 503)));
    await expect(getWeather(15.03, 120.69)).rejects.toThrow("HTTP 503");
  });

  it("rejects invalid coordinates before making a request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(getWeather(91, 120)).rejects.toBeInstanceOf(WeatherUnavailableError);
    await expect(getWeather(15, 181)).rejects.toBeInstanceOf(WeatherUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
