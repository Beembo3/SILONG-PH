import { NextResponse } from "next/server";
import { provinces, provinceWeatherPoint } from "@/lib/geography";
import { clearWeatherCache, getRegionWeather } from "@/lib/weather/open-meteo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/**
 * Scheduled cache warming for the seven province points.
 * Configure a scheduler (cron, GitHub Actions, hosting scheduler) to call this
 * every 10 minutes with `Authorization: Bearer $CRON_SECRET`.
 */
async function refresh(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured on this server." },
      { status: 503 },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("force") === "1") {
    clearWeatherCache();
  }

  const points = provinces.map((province) => {
    const point = provinceWeatherPoint(province);
    return {
      id: province.code,
      name: point.name,
      latitude: point.lat,
      longitude: point.lon,
    };
  });

  try {
    const result = await getRegionWeather(points);
    return NextResponse.json(
      {
        ok: true,
        refreshedAt: new Date().toISOString(),
        points: result.points.length,
        stale: result.stale,
        fetchedAt: result.fetchedAt,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("Scheduled weather refresh failed", error);
    return NextResponse.json(
      { ok: false, error: "Weather provider unavailable; cached data was not replaced." },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}

export async function GET(request: Request) {
  return refresh(request);
}

export async function POST(request: Request) {
  return refresh(request);
}
