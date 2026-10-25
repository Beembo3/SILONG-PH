import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALITY_CODE,
  geographyProvenance,
  getCapital,
  getDefaultLocality,
  getLocality,
  getProvince,
  localities,
  localitiesForProvince,
  localityLabel,
  provinceWeatherPoint,
  provinces,
  region,
  searchLocalities,
} from "@/lib/geography";

describe("geography dataset", () => {
  it("covers the seven provinces of Central Luzon", () => {
    expect(region.shortName).toBe("Region III");
    expect(provinces).toHaveLength(7);
    expect(provinces.map((province) => province.name)).toEqual([
      "Aurora",
      "Bataan",
      "Bulacan",
      "Nueva Ecija",
      "Pampanga",
      "Tarlac",
      "Zambales",
    ]);
  });

  it("contains 130 localities with 10-digit PSGC codes", () => {
    expect(localities).toHaveLength(130);
    for (const locality of localities) {
      expect(locality.code).toMatch(/^\d{10}$/);
      expect(locality.provinceCode).toMatch(/^\d{10}$/);
      expect(locality.name.length).toBeGreaterThan(0);
      expect(Number.isFinite(locality.lat)).toBe(true);
      expect(Number.isFinite(locality.lon)).toBe(true);
    }
  });

  it("has a valid province reference for every locality", () => {
    const provinceCodes = new Set(provinces.map((province) => province.code));
    for (const locality of localities) {
      expect(provinceCodes.has(locality.provinceCode)).toBe(true);
    }
  });

  it("has the expected locality count per province", () => {
    expect(localitiesForProvince("0307700000")).toHaveLength(8); // Aurora
    expect(localitiesForProvince("0300800000")).toHaveLength(12); // Bataan
    expect(localitiesForProvince("0301400000")).toHaveLength(24); // Bulacan
    expect(localitiesForProvince("0304900000")).toHaveLength(32); // Nueva Ecija
    expect(localitiesForProvince("0305400000")).toHaveLength(22); // Pampanga
    expect(localitiesForProvince("0306900000")).toHaveLength(18); // Tarlac
    expect(localitiesForProvince("0307100000")).toHaveLength(14); // Zambales
  });

  it("includes the independent cities with representative points", () => {
    const angeles = getLocality("0330100000");
    const olongapo = getLocality("0331400000");
    expect(angeles?.name).toBe("City of Angeles");
    expect(angeles?.isIndependent).toBe(true);
    expect(angeles?.boundaryAvailable).toBe(false);
    expect(olongapo?.name).toBe("City of Olongapo");
    expect(olongapo?.isIndependent).toBe(true);
    expect(olongapo?.boundaryAvailable).toBe(false);
  });

  it("records the source provenance", () => {
    expect(geographyProvenance.psgcUrl).toContain("psgc.gitlab.io");
    expect(geographyProvenance.names).toContain("Philippine Statistics Authority");
    expect(geographyProvenance.boundaryUrl).toContain("philippines-json-maps");
    expect(geographyProvenance.boundaries).toMatch(/MIT/i);
  });
});

describe("geography lookups", () => {
  it("finds provinces by code and slug", () => {
    expect(getProvince("0305400000")?.name).toBe("Pampanga");
    expect(getProvince("pampanga")?.code).toBe("0305400000");
    expect(getProvince("nueva-ecija")?.name).toBe("Nueva Ecija");
    expect(getProvince("atlantis")).toBeUndefined();
  });

  it("finds localities by PSGC code", () => {
    const locality = getLocality("0305416000");
    expect(locality?.name).toBe("City of San Fernando");
    expect(locality?.provinceName).toBe("Pampanga");
    expect(getLocality("0000000000")).toBeUndefined();
  });

  it("returns San Fernando as the default locality", () => {
    const locality = getDefaultLocality();
    expect(locality.code).toBe(DEFAULT_LOCALITY_CODE);
    expect(locality.name).toBe("City of San Fernando");
  });

  it("puts the provincial capital first in the locality list", () => {
    for (const province of provinces) {
      const list = localitiesForProvince(province.code);
      expect(list[0]?.isCapital).toBe(true);
      expect(list[0]?.code).toBe(province.capitalCode);
    }
  });

  it("returns the capital and a representative weather point", () => {
    const pampanga = getProvince("pampanga")!;
    const capital = getCapital(pampanga);
    expect(capital?.name).toBe("City of San Fernando");
    const point = provinceWeatherPoint(pampanga);
    expect(point.name).toBe(capital?.name);
    expect(point.lat).toBe(capital?.lat);
    expect(point.lon).toBe(capital?.lon);
  });

  it("searches localities by name, province, or code", () => {
    const byName = searchLocalities("Baler");
    expect(byName.some((locality) => locality.name === "Baler")).toBe(true);
    const byProvince = searchLocalities("Pampanga");
    expect(byProvince.length).toBeGreaterThan(0);
    expect(byProvince.every((locality) => locality.provinceName === "Pampanga")).toBe(true);
    const byCode = searchLocalities("0305416000");
    expect(byCode[0]?.code).toBe("0305416000");
  });

  it("limits an empty search and respects a province filter", () => {
    expect(searchLocalities("").length).toBeLessThanOrEqual(30);
    const aurora = searchLocalities("", "0307700000");
    expect(aurora).toHaveLength(8);
    expect(aurora.every((locality) => locality.provinceCode === "0307700000")).toBe(true);
  });

  it("formats a locality label", () => {
    const locality = getLocality("0305416000")!;
    expect(localityLabel(locality)).toBe("City of San Fernando, Pampanga");
  });
});
