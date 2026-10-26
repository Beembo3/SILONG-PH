import { NextResponse } from "next/server";
import { searchCoolingPlaces } from "@/lib/place-search";

export const dynamic = "force-dynamic";

function bool(value: string | null): boolean {
  return value === "1" || value === "true";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "24");
  try {
    const result = await searchCoolingPlaces({
      q: url.searchParams.get("q") ?? "",
      province: url.searchParams.get("province") ?? "",
      locality: url.searchParams.get("locality") ?? "",
      category: url.searchParams.get("category") ?? "",
      verification: url.searchParams.get("verification") ?? "",
      water: bool(url.searchParams.get("water")),
      accessible: bool(url.searchParams.get("accessible")),
      openNow: bool(url.searchParams.get("openNow")),
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 24,
    });
    return NextResponse.json(result, {
      headers: { "cache-control": "public, max-age=60, s-maxage=120" },
    });
  } catch (error) {
    console.error("Cooling place search failed", error);
    return NextResponse.json(
      { error: "Hindi available ang cooling-place directory sa ngayon." },
      { status: 503 },
    );
  }
}
