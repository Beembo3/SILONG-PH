import { describe, expect, it } from "vitest";
import {
  PLACE_CATEGORIES,
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  VERIFICATION_DESCRIPTIONS,
  VERIFICATION_LABELS,
  VERIFICATION_STATUSES,
  directionsUrl,
  hasAmenity,
  osmUrl,
  parseAmenities,
  verificationVariant,
} from "@/lib/places";

describe("verification labels", () => {
  it("has a label and description for every status", () => {
    for (const status of VERIFICATION_STATUSES) {
      expect(VERIFICATION_LABELS[status].length).toBeGreaterThan(0);
      expect(VERIFICATION_DESCRIPTIONS[status].length).toBeGreaterThan(0);
    }
  });

  it("maps statuses to badge variants", () => {
    expect(verificationVariant("VERIFIED")).toBe("success");
    expect(verificationVariant("PENDING")).toBe("warning");
    expect(verificationVariant("TEMPORARILY_UNAVAILABLE")).toBe("info");
    expect(verificationVariant("CLOSED")).toBe("danger");
    expect(verificationVariant("UNVERIFIED")).toBe("secondary");
    expect(verificationVariant("SOMETHING_ELSE")).toBe("secondary");
  });

  it("labels report types and statuses", () => {
    expect(REPORT_TYPE_LABELS.NEW_LOCATION).toBe("New location suggestion");
    expect(REPORT_TYPE_LABELS.OUTDATED_HOURS).toBe("Outdated hours");
    expect(REPORT_STATUS_LABELS.PENDING).toBe("Pending");
    expect(REPORT_STATUS_LABELS.ACTIONED).toBe("Actioned");
  });

  it("offers a controlled category list", () => {
    expect(PLACE_CATEGORIES).toContain("Public library");
    expect(PLACE_CATEGORIES).toContain("Designated cooling centre");
    expect(new Set(PLACE_CATEGORIES).size).toBe(PLACE_CATEGORIES.length);
  });
});

describe("parseAmenities", () => {
  it("parses a JSON array", () => {
    expect(parseAmenities('["Drinking water","Seating","Wheelchair access"]')).toEqual([
      "Drinking water",
      "Seating",
      "Wheelchair access",
    ]);
  });

  it("filters non-string values from JSON", () => {
    expect(parseAmenities('["Water", 3, null, {"x":1}, "Seating"]')).toEqual(["Water", "Seating"]);
  });

  it("falls back to comma-separated text", () => {
    expect(parseAmenities("Drinking water, Seating,  Wheelchair access ")).toEqual([
      "Drinking water",
      "Seating",
      "Wheelchair access",
    ]);
  });

  it("returns an empty list for null, empty, or malformed input", () => {
    expect(parseAmenities(null)).toEqual([]);
    expect(parseAmenities(undefined)).toEqual([]);
    expect(parseAmenities("")).toEqual([]);
    expect(parseAmenities("{not json")).toEqual(["{not json"]);
  });
});

describe("hasAmenity", () => {
  it("matches amenities case-insensitively", () => {
    expect(hasAmenity({ amenities: '["Drinking water"]' }, "drinking")).toBe(true);
    expect(hasAmenity({ amenities: '["Wheelchair access"]' }, "WHEELCHAIR")).toBe(true);
    expect(hasAmenity({ amenities: '["Seating"]' }, "water")).toBe(false);
  });
});

describe("map links", () => {
  it("builds a Google Maps directions link", () => {
    expect(directionsUrl(15.0286, 120.6898)).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=15.0286,120.6898",
    );
  });

  it("builds an OpenStreetMap link", () => {
    expect(osmUrl(15.0286, 120.6898)).toBe(
      "https://www.openstreetmap.org/?mlat=15.0286&mlon=120.6898#map=17/15.0286/120.6898",
    );
  });
});
