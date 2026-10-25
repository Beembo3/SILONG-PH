/**
 * Builds the Central Luzon geography dataset from:
 *  - PSA PSGC API (names, codes, city/municipality status, capital flags)
 *    https://psgc.gitlab.io/api/
 *  - faeldon/philippines-json-maps 2023 low-resolution GeoJSON
 *    https://github.com/faeldon/philippines-json-maps (MIT)
 *
 * The script is deterministic and can be re-run with `npm run geo:build`.
 * Raw downloads live in data/raw and are intentionally gitignored.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW = path.join(ROOT, "data", "raw");
const OUT_GEO = path.join(ROOT, "public", "geo");
const OUT_DATA = path.join(ROOT, "src", "data");

const PROVINCES = [
  { code9: "030800000", code10: "0300800000", slug: "bataan", file: "bataan.geojson" },
  { code9: "031400000", code10: "0301400000", slug: "bulacan", file: "bulacan.geojson" },
  { code9: "034900000", code10: "0304900000", slug: "nueva-ecija", file: "nueva-ecija.geojson" },
  { code9: "035400000", code10: "0305400000", slug: "pampanga", file: "pampanga.geojson" },
  { code9: "036900000", code10: "0306900000", slug: "tarlac", file: "tarlac.geojson" },
  { code9: "037100000", code10: "0307100000", slug: "zambales", file: "zambales.geojson" },
  { code9: "037700000", code10: "0307700000", slug: "aurora", file: "aurora.geojson" },
];

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": "ELNinoPH-geodata-builder/1.0" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function geocodeLocality(name) {
  const query = name.replace(/^City of\s+/i, "");
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=20&language=en&format=json`;
  try {
    const data = await getJson(url);
    const match = (data.results ?? []).find(
      (r) => r.country_code === "PH" && r.admin1 === "Central Luzon",
    );
    if (match) {
      return { lat: match.latitude, lon: match.longitude, source: url };
    }
  } catch {
    console.warn(`  ! geocoder unavailable for ${name}; using documented fallback point`);
  }
  const fallbacks = {
    "City of Angeles": { lat: 15.15, lon: 120.58333 },
    "City of Olongapo": { lat: 14.82917, lon: 120.28278 },
  };
  const fallback = fallbacks[name];
  if (!fallback) throw new Error(`Unable to geocode independent city ${name}`);
  return {
    ...fallback,
    source:
      "Open-Meteo Geocoding API result recorded 2026-10-25 (network fallback in build script)",
  };
}

function ringArea(ring) {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(area / 2);
}

function ringCentroid(ring) {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    a += f;
    cx += (ring[j][0] + ring[i][0]) * f;
    cy += (ring[j][1] + ring[i][1]) * f;
  }
  if (a === 0) {
    const avg = ring.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [avg[0] / ring.length, avg[1] / ring.length];
  }
  a *= 0.5;
  return [cx / (6 * a), cy / (6 * a)];
}

function geometryCentroid(geometry) {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let best = null;
  let bestArea = -1;
  for (const polygon of polygons) {
    const outer = polygon[0];
    const area = ringArea(outer);
    if (area > bestArea) {
      bestArea = area;
      best = outer;
    }
  }
  if (!best) throw new Error("No polygon ring");
  const [lon, lat] = ringCentroid(best);
  return {
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    areaKm2: Number((bestArea * 111.32 * 111.32 * Math.cos((lat * Math.PI) / 180)).toFixed(2)),
  };
}

function psgc10(value) {
  return String(value).padStart(10, "0");
}

function normalizeFeature(feature, extra) {
  return {
    type: "Feature",
    properties: {
      code: psgc10(feature.properties.adm3_psgc ?? feature.properties.adm2_psgc),
      name: feature.properties.adm3_en || feature.properties.adm2_en,
      ...extra,
    },
    geometry: feature.geometry,
  };
}

async function main() {
  fs.mkdirSync(OUT_GEO, { recursive: true });
  fs.mkdirSync(OUT_DATA, { recursive: true });
  fs.mkdirSync(RAW, { recursive: true });

  const provinceGeo = JSON.parse(fs.readFileSync(path.join(RAW, "provinces.geojson"), "utf8"));
  const psgcProvinces = await getJson("https://psgc.gitlab.io/api/regions/030000000/provinces/");

  const provinces = [];
  const localities = [];
  const combinedFeatures = [];

  for (const p of PROVINCES) {
    const psgc = psgcProvinces.find((x) => x.code === p.code9);
    if (!psgc) throw new Error(`Missing PSGC province ${p.code9}`);
    const geo = JSON.parse(fs.readFileSync(path.join(RAW, p.file), "utf8"));
    const provinceFeature = provinceGeo.features.find(
      (f) => psgc10(f.properties.adm2_psgc) === p.code10,
    );
    if (!provinceFeature) throw new Error(`Missing province geometry ${p.code10}`);
    const pc = geometryCentroid(provinceFeature.geometry);

    const psgcLocalities = await getJson(
      `https://psgc.gitlab.io/api/provinces/${p.code9}/cities-municipalities/`,
    );

    const provinceLocalities = [];
    for (const locality of psgcLocalities) {
      const feature = geo.features.find(
        (f) => psgc10(f.properties.adm3_psgc) === locality.psgc10DigitCode,
      );
      let record;
      if (!feature) {
        // Highly urbanised cities (Angeles, Olongapo) are independent of the
        // provincial boundary files. Keep the official PSGC record and use a
        // geocoded representative point, explicitly marked as having no
        // boundary geometry in this dataset.
        const point = await geocodeLocality(locality.name);
        record = {
          code: locality.psgc10DigitCode,
          code9: locality.code,
          name: locality.name,
          type: locality.isCity ? "City" : "Municipality",
          provinceCode: p.code10,
          provinceName: psgc.name,
          provinceSlug: p.slug,
          lat: Number(point.lat.toFixed(6)),
          lon: Number(point.lon.toFixed(6)),
          areaKm2: null,
          isCapital: Boolean(locality.isCapital),
          isCity: Boolean(locality.isCity),
          isIndependent: true,
          boundaryAvailable: false,
          coordinateSource: point.source,
          psgc10DigitCode: locality.psgc10DigitCode,
        };
        console.log(`  + independent city ${locality.name}: geocoded representative point`);
      } else {
        const c = geometryCentroid(feature.geometry);
        record = {
          code: locality.psgc10DigitCode,
          code9: locality.code,
          name: locality.name,
          type: locality.isCity ? "City" : "Municipality",
          provinceCode: p.code10,
          provinceName: psgc.name,
          provinceSlug: p.slug,
          lat: c.lat,
          lon: c.lon,
          areaKm2: feature.properties.area_km2 ?? c.areaKm2,
          isCapital: Boolean(locality.isCapital),
          isCity: Boolean(locality.isCity),
          isIndependent: false,
          boundaryAvailable: true,
          psgc10DigitCode: locality.psgc10DigitCode,
        };
        combinedFeatures.push(
          normalizeFeature(feature, {
            provinceCode: p.code10,
            provinceName: psgc.name,
            type: record.type,
          }),
        );
      }
      localities.push(record);
      provinceLocalities.push(record);
    }

    const capital = provinceLocalities.find((l) => l.isCapital) ?? provinceLocalities[0];
    if (!capital) throw new Error(`No localities for ${psgc.name}`);
    provinces.push({
      code: p.code10,
      code9: p.code9,
      name: psgc.name,
      slug: p.slug,
      psgc10DigitCode: psgc.psgc10DigitCode,
      lat: pc.lat,
      lon: pc.lon,
      areaKm2: provinceFeature.properties.area_km2 ?? pc.areaKm2,
      capitalCode: capital.code,
      capitalName: capital.name,
      localityCount: provinceLocalities.length,
    });
    console.log(`${psgc.name}: ${provinceLocalities.length} LGUs, capital ${capital.name}`);
  }

  localities.sort((a, b) => a.name.localeCompare(b.name));
  provinces.sort((a, b) => a.name.localeCompare(b.name));

  const provinceOut = {
    type: "FeatureCollection",
    name: "Central Luzon provinces (PSGC 2023)",
    features: provinceGeo.features
      .map((f) => {
        const code = psgc10(f.properties.adm2_psgc);
        const province = provinces.find((p) => p.code === code);
        return {
          ...f,
          properties: {
            code,
            name: f.properties.adm2_en,
            slug: province?.slug,
            capitalCode: province?.capitalCode,
            capitalName: province?.capitalName,
          },
        };
      })
      .sort((a, b) => a.properties.name.localeCompare(b.properties.name)),
  };

  const municipalitiesOut = {
    type: "FeatureCollection",
    name: "Central Luzon cities and municipalities (PSGC 2023)",
    features: combinedFeatures
      .filter((f) => typeof f.properties.name === "string" && f.properties.name.length > 0)
      .sort((a, b) => a.properties.name.localeCompare(b.properties.name)),
  };

  const dataset = {
    region: {
      code: "030000000",
      name: "Central Luzon",
      shortName: "Region III",
      center: { lat: 15.45, lon: 120.75 },
    },
    provenance: {
      names: "Philippine Statistics Authority PSGC API (fetched 2026-10-25)",
      boundaries:
        "faeldon/philippines-json-maps 2023, derived from PSA PSGC shapefiles (MIT license)",
      boundaryUrl: "https://github.com/faeldon/philippines-json-maps",
      psgcUrl: "https://psgc.gitlab.io/api/",
      note: "Centroids are geometric centroids of official boundary polygons and are used only as weather model sample points. They are not barangay centroids or measurement stations.",
    },
    provinces,
    localities,
  };

  fs.writeFileSync(path.join(OUT_GEO, "provinces.geojson"), JSON.stringify(provinceOut));
  fs.writeFileSync(
    path.join(OUT_GEO, "municipalities.geojson"),
    JSON.stringify(municipalitiesOut),
  );
  fs.writeFileSync(path.join(OUT_DATA, "geography.json"), JSON.stringify(dataset, null, 2));
  fs.writeFileSync(
    path.join(OUT_DATA, "geography.ts"),
    `// Generated by scripts/build-geodata.mjs. Do not edit by hand.\n` +
      `import type { GeographyDataset } from "@/lib/geography-types";\n\n` +
      `export const geography = ${JSON.stringify(dataset, null, 2)} satisfies GeographyDataset;\n`,
  );

  console.log(
    `\nWrote ${provinces.length} provinces, ${localities.length} cities/municipalities.`,
  );
  console.log(`Province GeoJSON: ${(fs.statSync(path.join(OUT_GEO, "provinces.geojson")).size / 1024).toFixed(1)} KB`);
  console.log(`Municipality GeoJSON: ${(fs.statSync(path.join(OUT_GEO, "municipalities.geojson")).size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
