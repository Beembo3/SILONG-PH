import type { CoolingPlace } from "@prisma/client";

export const VERIFICATION_STATUSES = [
  "VERIFIED",
  "PENDING",
  "TEMPORARILY_UNAVAILABLE",
  "CLOSED",
  "UNVERIFIED",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: "Verified",
  PENDING: "Pending verification",
  TEMPORARILY_UNAVAILABLE: "Temporarily unavailable",
  CLOSED: "Closed",
  UNVERIFIED: "Unverified",
};

export const VERIFICATION_DESCRIPTIONS: Record<VerificationStatus, string> = {
  VERIFIED:
    "An authorised reviewer has checked the facility details, public access, and cooling suitability. Confirm current conditions before travelling.",
  PENDING:
    "A reviewer has started checking this location. It is not yet confirmed as a cooling facility.",
  TEMPORARILY_UNAVAILABLE:
    "Previously reviewed, but currently reported as unavailable. Do not rely on it without checking.",
  CLOSED: "Reported or confirmed closed. It should not be used as a cooling destination.",
  UNVERIFIED:
    "This is a public-facility record from an external source. Public access and cooling suitability have not been verified by SILONG PH.",
};

export const PLACE_CATEGORIES = [
  "Public library",
  "Community centre",
  "Designated cooling centre",
  "Government building",
  "Health facility",
  "Water-refill station",
  "Shaded public rest area",
  "Shopping Malls",
  "Public park",
  "Nature park",
  "National park",
  "Waterfall",
  "Public museum",
  "Sports and recreation park",
  "Other public facility",
] as const;

/**
 * Public Taglish labels. Database values stay in English so filtering,
 * imports, and existing records keep working.
 */
export const PLACE_CATEGORY_LABELS: Record<string, string> = {
  "Public library": "Pampublikong aklatan",
  "Community centre": "Sentro ng komunidad",
  "Designated cooling centre": "Itinalagang cooling center",
  "Government building": "Gusali ng gobyerno",
  "Health facility": "Pasilidad pangkalusugan",
  "Water-refill station": "Istasyon ng water refilling",
  "Shaded public rest area": "May lilim na pahingahan",
  "Shopping Malls": "Mall na may aircon",
  "Public park": "Pampublikong parke",
  "Nature park": "Parke ng kalikasan",
  "National park": "Pambansang parke",
  "Waterfall": "Talon",
  "Public museum": "Pampublikong museo",
  "Sports and recreation park": "Parke para sa sports at recreation",
  "Other public facility": "Iba pang pampublikong lugar",
};

export const PLACE_CATEGORY_GROUPS: Array<{ label: string; categories: string[] }> = [
  {
    label: "Preskong lugar sa loob",
    categories: [
      "Shopping Malls",
      "Public library",
      "Public museum",
      "Community centre",
      "Designated cooling centre",
      "Government building",
      "Health facility",
    ],
  },
  {
    label: "Parks at nature",
    categories: ["Public park", "Nature park", "National park", "Waterfall", "Sports and recreation park", "Shaded public rest area"],
  },
  {
    label: "Iba pang pampublikong lugar",
    categories: ["Water-refill station", "Other public facility"],
  },
];

export const VERIFICATION_DISPLAY_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: "Beripikado",
  PENDING: "Sinusuri pa",
  TEMPORARILY_UNAVAILABLE: "Pansamantalang hindi available",
  CLOSED: "Sarado",
  UNVERIFIED: "Hindi pa beripikado",
};

export const VERIFICATION_DISPLAY_DESCRIPTIONS: Record<VerificationStatus, string> = {
  VERIFIED:
    "Sinuri ng awtorisadong reviewer ang detalye ng pasilidad, public access, at pagiging angkop nito bilang cooling place. I-confirm pa rin ang kondisyon bago pumunta.",
  PENDING: "Sinimulan pa lang suriin ang lugar na ito. Hindi pa ito kumpirmadong cooling place.",
  TEMPORARILY_UNAVAILABLE:
    "Nasuri na dati, pero iniulat na hindi available ngayon. Huwag umasa nang hindi nagche-check.",
  CLOSED: "Iniulat o kumpirmadong sarado. Huwag itong gamitin bilang cooling destination.",
  UNVERIFIED:
    "Public facility record ito mula sa external source. Hindi pa sinuri ng SILONG PH ang public access at pagiging angkop nito bilang cooling place.",
};

export const REPORT_TYPES = [
  "INCORRECT_DETAILS",
  "OUTDATED_HOURS",
  "PERMANENTLY_CLOSED",
  "INACCURATE_DIRECTIONS",
  "MISSING_ACCESSIBILITY",
  "NEW_LOCATION",
  "OTHER",
] as const;

export const REPORT_TYPE_LABELS: Record<string, string> = {
  INCORRECT_DETAILS: "Incorrect details",
  OUTDATED_HOURS: "Outdated hours",
  PERMANENTLY_CLOSED: "Permanently closed",
  INACCURATE_DIRECTIONS: "Inaccurate directions",
  MISSING_ACCESSIBILITY: "Missing accessibility information",
  NEW_LOCATION: "New location suggestion",
  OTHER: "Other",
};

export const REPORT_STATUSES = ["PENDING", "REVIEWED", "ACTIONED", "DISMISSED"] as const;

export const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  ACTIONED: "Actioned",
  DISMISSED: "Dismissed",
};

export const REPORT_TYPE_DISPLAY_LABELS: Record<string, string> = {
  INCORRECT_DETAILS: "Mali ang pangalan, address, o detalye",
  OUTDATED_HOURS: "Luma na ang oras ng pagbubukas",
  PERMANENTLY_CLOSED: "Permanenteng sarado",
  INACCURATE_DIRECTIONS: "Mali ang lokasyon o direksyon",
  MISSING_ACCESSIBILITY: "Kulang o mali ang impormasyon sa accessibility",
  NEW_LOCATION: "Magmungkahi ng bagong lugar",
  OTHER: "Iba pang bagay",
};

export const REPORT_STATUS_DISPLAY_LABELS: Record<string, string> = {
  PENDING: "Nakabinbin",
  REVIEWED: "Nasuri",
  ACTIONED: "Naaksyunan",
  DISMISSED: "Hindi pinansin",
};

export function amenityLabel(amenity: string): string {
  const normalized = amenity.trim().toLowerCase();
  if (normalized.includes("drinking water")) return "Inuming tubig";
  if (normalized.includes("wheelchair")) return "Wheelchair access";
  if (normalized.includes("toilet") || normalized.includes("restroom")) return "Banyo";
  if (normalized.includes("air condition") || normalized.includes("air-condition")) return "Aircon";
  if (normalized.includes("seating") || normalized.includes("seat")) return "Upuan";
  if (normalized.includes("parking")) return "Parking";
  if (normalized.includes("wifi") || normalized.includes("wi-fi")) return "Wi-Fi";
  return amenity;
}

export function openStateLabel(label: string): string {
  switch (label) {
    case "Open 24/7":
      return "Bukas 24/7";
    case "Open now (according to listed hours)":
      return "Bukas ngayon (ayon sa nakalistang oras)";
    case "Closed according to listed hours":
      return "Sarado ayon sa nakalistang oras";
    case "Operating hours not verified":
      return "Hindi pa beripikado ang oras";
    default:
      return label;
  }
}

export function parseAmenities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    // Older records may store comma-separated text.
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasAmenity(place: Pick<CoolingPlace, "amenities">, needle: string): boolean {
  return parseAmenities(place.amenities).some((a) => a.toLowerCase().includes(needle.toLowerCase()));
}

const DAY_INDEX: Record<string, number> = {
  Su: 0,
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
};

interface DayRule {
  days: Set<number>;
  windows: Array<{ start: number; end: number }>;
}

function parseDayToken(token: string): number[] | null {
  const clean = token.trim();
  if (!clean) return null;
  if (clean === "PH") return [1, 2, 3, 4, 5];
  if (clean.includes("-")) {
    const [start, end] = clean.split("-").map((x) => x.trim());
    if (!(start in DAY_INDEX) || !(end in DAY_INDEX)) return null;
    const a = DAY_INDEX[start];
    const b = DAY_INDEX[end];
    const days: number[] = [];
    let cursor = a;
    for (let i = 0; i < 7; i++) {
      days.push(cursor);
      if (cursor === b) break;
      cursor = (cursor + 1) % 7;
    }
    return days;
  }
  if (clean in DAY_INDEX) return [DAY_INDEX[clean]];
  return null;
}

function parseTime(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function parseOperatingHours(raw: string | null | undefined): DayRule[] | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || /sunrise|sunset|off|closed/i.test(value)) return null;
  if (value === "24/7") {
    return [{ days: new Set([0, 1, 2, 3, 4, 5, 6]), windows: [{ start: 0, end: 1440 }] }];
  }
  const rules: DayRule[] = [];
  for (const chunk of value.split(";")) {
    const match = chunk
      .trim()
      .match(/^([A-Za-z,\-\s]+?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!match) continue;
    const days = new Set<number>();
    for (const token of match[1].split(",")) {
      const parsed = parseDayToken(token);
      if (!parsed) continue;
      parsed.forEach((day) => days.add(day));
    }
    const start = parseTime(match[2]);
    const end = parseTime(match[3]);
    if (days.size === 0 || start == null || end == null) continue;
    rules.push({ days, windows: [{ start, end }] });
  }
  return rules.length > 0 ? rules : null;
}

export interface OpenState {
  known: boolean;
  open: boolean | null;
  label: string;
}

export function evaluateOpenNow(
  raw: string | null | undefined,
  now = new Date(),
): OpenState {
  const rules = parseOperatingHours(raw);
  if (!rules) {
    return { known: false, open: null, label: "Operating hours not verified" };
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const day = DAY_INDEX[weekday.slice(0, 2)];
  const minutes = hour * 60 + minute;
  for (const rule of rules) {
    if (!rule.days.has(day)) continue;
    for (const window of rule.windows) {
      if (window.start === 0 && window.end === 1440) return { known: true, open: true, label: "Open 24/7" };
      if (minutes >= window.start && minutes < window.end) {
        return { known: true, open: true, label: "Open now (according to listed hours)" };
      }
    }
  }
  return { known: true, open: false, label: "Closed according to listed hours" };
}

export function verificationVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "secondary" {
  switch (status) {
    case "VERIFIED":
      return "success";
    case "PENDING":
      return "warning";
    case "TEMPORARILY_UNAVAILABLE":
      return "info";
    case "CLOSED":
      return "danger";
    default:
      return "secondary";
  }
}

export function directionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function osmUrl(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

export function placeCategoryLabel(category: string): string {
  return PLACE_CATEGORY_LABELS[category] ?? category;
}
