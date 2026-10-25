import { NextResponse } from "next/server";
import { getWeather, WeatherUnavailableError } from "@/lib/weather/open-meteo";
import { weatherQuerySchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = weatherQuerySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lon: url.searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide valid latitude and longitude coordinates." },
      { status: 400 },
    );
  }

  try {
    const weather = await getWeather(parsed.data.lat, parsed.data.lon);
    return NextResponse.json(weather, {
      status: 200,
      headers: {
        "cache-control": weather.stale ? "no-store" : "public, max-age=300, s-maxage=600",
      },
    });
  } catch (error) {
    const message =
      error instanceof WeatherUnavailableError
        ? error.message
        : "Weather data is temporarily unavailable.";
    console.error("Weather API failure", error);
    return NextResponse.json(
      {
        error: message,
        code: "WEATHER_UNAVAILABLE",
        retryable: true,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
