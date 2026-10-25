import "server-only";
import { prisma } from "@/lib/prisma";
import { evaluateOpenNow, parseAmenities } from "@/lib/places";

export interface PlaceSearchParams {
  q?: string;
  province?: string;
  locality?: string;
  category?: string;
  verification?: string;
  water?: boolean;
  accessible?: boolean;
  openNow?: boolean;
  lat?: number;
  lon?: number;
  page?: number;
  pageSize?: number;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)) * 10) / 10;
}

export async function searchCoolingPlaces(params: PlaceSearchParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 24));
  const where = {
    archivedAt: null,
    ...(params.province ? { provinceCode: params.province } : {}),
    ...(params.locality ? { localityCode: params.locality } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.verification ? { verificationStatus: params.verification } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q } },
            { address: { contains: params.q } },
            { category: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.water ? { amenities: { contains: "Drinking water" } } : {}),
    ...(params.accessible ? { amenities: { contains: "Wheelchair" } } : {}),
    ...(params.openNow ? { operatingHours: { not: null } } : {}),
  };

  const candidates = await prisma.coolingPlace.findMany({
    where,
    orderBy: [{ name: "asc" }],
    take: params.openNow ? 500 : pageSize * page,
  });

  const now = new Date();
  let enriched = candidates.map((place) => {
    const amenities = parseAmenities(place.amenities);
    const openState = evaluateOpenNow(place.operatingHours, now);
    return {
      ...place,
      amenities,
      openState,
      distanceKm:
        params.lat != null && params.lon != null
          ? distanceKm(params.lat, params.lon, place.latitude, place.longitude)
          : null,
    };
  });

  if (params.openNow) {
    enriched = enriched.filter((place) => place.openState.open === true);
  }

  if (params.lat != null && params.lon != null) {
    enriched.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    enriched.sort((a, b) => {
      const rank = (status: string) => (status === "VERIFIED" ? 0 : status === "PENDING" ? 1 : 2);
      return rank(a.verificationStatus) - rank(b.verificationStatus) || a.name.localeCompare(b.name);
    });
  }

  const total = enriched.length;
  const start = (page - 1) * pageSize;
  return {
    items: enriched.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}
