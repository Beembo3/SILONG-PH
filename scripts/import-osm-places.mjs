/**
 * Converts the Overpass extract in data/raw/coolplaces-osm.json into a seed
 * dataset. Every imported record is explicitly UNVERIFIED: OpenStreetMap tells
 * us a public facility exists, not that it is a suitable cooling place.
 *
 * Source: OpenStreetMap contributors, ODbL 1.0.
 * Query: libraries and community centres within a Central Luzon bounding box.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW = path.join(ROOT, "data", "raw");
const OUT = path.join(ROOT, "data", "seed-places.json");

const PROVINCE_FILES = [
  { code: "0300800000", name: "Bataan", file: "bataan.geojson" },
  { code: "0301400000", name: "Bulacan", file: "bulacan.geojson" },
  { code: "0304900000", name: "Nueva Ecija", file: "nueva-ecija.geojson" },
  { code: "0305400000", name: "Pampanga", file: "pampanga.geojson" },
  { code: "0306900000", name: "Tarlac", file: "tarlac.geojson" },
  { code: "0307100000", name: "Zambales", file: "zambales.geojson" },
  { code: "0307700000", name: "Aurora", file: "aurora.geojson" },
];

function psgc10(value) {
  return String(value).padStart(10, "0");
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    if (!pointInRing(point, polygon[0])) continue;
    let inHole = false;
    for (let i = 1; i < polygon.length; i++) {
      if (pointInRing(point, polygon[i])) inHole = true;
    }
    if (!inHole) return true;
  }
  return false;
}

function loadFeatures(file) {
  return JSON.parse(fs.readFileSync(path.join(RAW, file), "utf8")).features;
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const geography = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "geography.json"), "utf8"),
);

const provinceFeatures = PROVINCE_FILES.map((p) => ({
  ...p,
  features: loadFeatures(p.file),
}));

const raw = JSON.parse(fs.readFileSync(path.join(RAW, "coolplaces-osm.json"), "utf8"));

const places = [];
const seen = new Set();

for (const element of raw.elements ?? []) {
  const tags = element.tags ?? {};
  if (!tags.name || !["library", "community_centre"].includes(tags.amenity)) continue;
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (typeof lat !== "number" || typeof lon !== "number") continue;

  let province = null;
  for (const p of provinceFeatures) {
    if (p.features.some((f) => pointInPolygon([lon, lat], f.geometry))) {
      province = p;
      break;
    }
  }
  if (!province) continue;

  let locality = null;
  for (const feature of province.features) {
    if (pointInPolygon([lon, lat], feature.geometry)) {
      const code = psgc10(feature.properties.adm3_psgc);
      locality = geography.localities.find((l) => l.code === code) ?? null;
      break;
    }
  }
  if (!locality) {
    // Independent cities have no boundary geometry in the source files.
    const nearest = geography.localities
      .filter((l) => l.provinceCode === province.code)
      .map((l) => ({ l, distance: distanceKm({ lat, lon }, l) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance <= 15) locality = nearest.l;
  }
  if (!locality) continue;

  const key = `${element.type}/${element.id}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:barangay"],
    tags["addr:city"] || locality.name,
    province.name,
  ].filter(Boolean);

  const amenities = [];
  if (tags.air_conditioning === "yes") amenities.push("Air-conditioning reported in OpenStreetMap");
  if (tags.drinking_water === "yes") amenities.push("Drinking water reported");
  if (tags.toilets === "yes") amenities.push("Toilets reported");
  if (tags.wheelchair === "yes") amenities.push("Wheelchair access reported");
  if (tags.internet_access === "wlan" || tags.internet_access === "yes")
    amenities.push("Internet access reported");

  places.push({
    osmId: key,
    name: tags.name,
    category: tags.amenity === "library" ? "Public library" : "Community centre",
    address:
      addressParts.length > 0
        ? addressParts.join(", ")
        : `Address not recorded in OpenStreetMap; ${locality.name}, ${province.name}`,
    provinceCode: province.code,
    provinceName: province.name,
    localityCode: locality.code,
    localityName: locality.name,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    operatingHours: tags.opening_hours ?? null,
    accessibilityDetails:
      tags.wheelchair === "yes"
        ? "Wheelchair access tagged in OpenStreetMap; confirm on site."
        : tags.wheelchair === "no"
          ? "Tagged as not wheelchair accessible in OpenStreetMap."
          : null,
    amenities: JSON.stringify(amenities),
    publicAccessDetails:
      "Public access and cooling suitability have not been verified by SILONG PH. This is an OpenStreetMap public-facility record, not a confirmed cooling centre.",
    verificationStatus: "UNVERIFIED",
    verificationNote:
      "Imported from OpenStreetMap. Needs an authorised verifier to confirm public access, cooling, water, and current operating hours.",
    sourceUrl: `https://www.openstreetmap.org/${key}`,
    contactInformation: [tags.phone, tags.website].filter(Boolean).join(" · ") || null,
    photoUrl: tags.image ?? null,
    photoCredit: tags.image ? "OpenStreetMap contributor" : null,
    osmTags: tags,
  });
}

places.sort((a, b) => a.provinceName.localeCompare(b.provinceName) || a.name.localeCompare(b.name));
fs.writeFileSync(OUT, JSON.stringify({ source: "OpenStreetMap", places }, null, 2));
console.log(`Wrote ${places.length} unverified public-facility records to ${OUT}`);
for (const p of places.slice(0, 12)) console.log(`- ${p.name} (${p.localityName}, ${p.provinceName})`);
