/**
 * Verified official source integration for SILONG PH alerts.
 * Only sources with real, documented integration methods are listed.
 * No invented endpoints. No fabricated alerts.
 */

export const DILG_REGION_III_RSS_URL =
  "https://centralluzon.region3.dilg.gov.ph/feed/";

export const PAGASA_HEAT_INDEX_URL =
  "https://pagasa.dost.gov.ph/weather/heat-index";

export const PAGASA_WEATHER_ADVISORY_URL =
  "https://pagasa.dost.gov.ph/weather/weather-advisory";

export const NDRRMC_URL = "https://ndrrmc.gov.ph/";

export const OCD_URL = "https://ocd.gov.ph/";

export const PHIVOLCS_URL = "https://phivolcs.dost.gov.ph/";

export interface SourceStatus {
  source: string;
  url: string;
  method: "manual" | "rss" | "api" | "linked";
  lastChecked: string; // ISO
  status: "healthy" | "partial" | "unavailable" | "manual-review-only";
  note: string;
}

export const OFFICIAL_SOURCE_REGISTRY: SourceStatus[] = [
  {
    source: "DILG Region III — Regional News / Advisories (RSS)",
    url: DILG_REGION_III_RSS_URL,
    method: "rss",
    lastChecked: "2026-10-25",
    status: "healthy",
    note: "Verified RSS feed (WordPress). Last build 2026-10-22. Uses for regional awareness; not structured emergency bulletins. Manual admin review required for disaster classification.",
  },
  {
    source: "PAGASA — Heat Index",
    url: PAGASA_HEAT_INDEX_URL,
    method: "linked",
    lastChecked: "2026-10-25",
    status: "manual-review-only",
    note: "No public structured bulletin API documented. Manual admin entry with source URL required.",
  },
  {
    source: "PAGASA — Weather Advisory",
    url: PAGASA_WEATHER_ADVISORY_URL,
    method: "linked",
    lastChecked: "2026-10-25",
    status: "manual-review-only",
    note: "HTML page only. No verified RSS/API for auto-ingestion.",
  },
  {
    source: "NDRRMC",
    url: NDRRMC_URL,
    method: "linked",
    lastChecked: "2026-10-25",
    status: "manual-review-only",
    note: "Official advisories published on site; no confirmed public bulletins API.",
  },
  {
    source: "OCD (Office of Civil Defense)",
    url: OCD_URL,
    method: "linked",
    lastChecked: "2026-10-25",
    status: "manual-review-only",
    note: "Official announcements on site; requires manual verification.",
  },
  {
    source: "PHIVOLCS",
    url: PHIVOLCS_URL,
    method: "linked",
    lastChecked: "2026-10-25",
    status: "manual-review-only",
    note: "Earthquake / volcanic bulletins on site; no verified automated endpoint.",
  },
];
