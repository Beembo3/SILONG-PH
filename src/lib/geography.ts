import { geography } from "@/data/geography";
import type { GeographyDataset, Locality, Province } from "./geography-types";

const data = geography as GeographyDataset;

export const region = data.region;
export const provinces: Province[] = data.provinces;
export const localities: Locality[] = data.localities;
export const geographyProvenance = data.provenance;

const provinceByCode = new Map(provinces.map((p) => [p.code, p]));
const provinceBySlug = new Map(provinces.map((p) => [p.slug, p]));
const localityByCode = new Map(localities.map((l) => [l.code, l]));

export const DEFAULT_LOCALITY_CODE = "0305416000"; // City of San Fernando, Pampanga

export function getProvince(code: string): Province | undefined {
  return provinceByCode.get(code) ?? provinceBySlug.get(code);
}

export function getLocality(code: string): Locality | undefined {
  return localityByCode.get(code);
}

export function getDefaultLocality(): Locality {
  return getLocality(DEFAULT_LOCALITY_CODE) ?? localities[0];
}

export function localitiesForProvince(provinceCode: string): Locality[] {
  return localities
    .filter((l) => l.provinceCode === provinceCode)
    .sort((a, b) => {
      if (a.isCapital !== b.isCapital) return a.isCapital ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function searchLocalities(query: string, provinceCode?: string): Locality[] {
  const q = query.trim().toLowerCase();
  const pool = provinceCode
    ? localities.filter((l) => l.provinceCode === provinceCode)
    : localities;
  if (!q) return pool.slice(0, 30);
  return pool
    .filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.provinceName.toLowerCase().includes(q) ||
        l.code.includes(q),
    )
    .slice(0, 30);
}

export function localityLabel(locality: Locality): string {
  return `${locality.name}, ${locality.provinceName}`;
}

export function getCapital(province: Province): Locality | undefined {
  return getLocality(province.capitalCode);
}

export function provinceWeatherPoint(province: Province): { lat: number; lon: number; name: string } {
  const capital = getCapital(province);
  return {
    lat: capital?.lat ?? province.lat,
    lon: capital?.lon ?? province.lon,
    name: capital?.name ?? province.name,
  };
}
