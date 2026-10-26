import { NextResponse } from "next/server";
import { getProvince, provinces, provinceWeatherPoint } from "@/lib/geography";
import { getRegionWeather, WeatherUnavailableError } from "@/lib/weather/open-meteo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("provinces");
  const selected = requested
    ? requested
        .split(",")
        .map((code) => getProvince(code.trim()))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    : provinces;

  if (selected.length === 0) {
    return NextResponse.json({ error: "No valid provinces requested." }, { status: 400 });
  }

  const points = selected.map((province) => {
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
        ...result,
        provinces: selected.map((province) => {
          const point = result.points.find((p) => p.id === province.code);
          return {
            code: province.code,
            name: province.name,
            slug: province.slug,
            capitalName: province.capitalName,
            weather: point?.snapshot ?? null,
          };
        }),
        note:
          "Kinakatawan ng Open-Meteo model grid data sa capital o representative point ang bawat probinsya. Hindi ito province-wide measurement at hindi dapat basahin bilang barangay-level data.",
      },
      { headers: { "cache-control": "public, max-age=300, s-maxage=600" } },
    );
  } catch (error) {
    console.error("Region weather API failure", error);
    return NextResponse.json(
      {
        error:
          error instanceof WeatherUnavailableError
            ? error.message
            : "Hindi available ang regional weather data sa ngayon.",
        code: "WEATHER_UNAVAILABLE",
        retryable: true,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
