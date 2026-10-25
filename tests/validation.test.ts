import { describe, expect, it } from "vitest";
import {
  alertCreateSchema,
  alertUpdateSchema,
  loginSchema,
  placeCreateSchema,
  placeSearchSchema,
  placeUpdateSchema,
  reportSchema,
  reportUpdateSchema,
  verifyPlaceSchema,
  weatherQuerySchema,
} from "@/lib/validation";

const validPlace = {
  name: "San Fernando Public Library",
  category: "Public library",
  address: "City of San Fernando, Pampanga",
  provinceCode: "0305400000",
  localityCode: "0305416000",
  latitude: "15.0286",
  longitude: "120.6898",
  operatingHours: "Mo-Fr 08:00-17:00",
  accessibilityDetails: "Ground-floor entrance",
  amenities: ["Drinking water", "Seating"],
  publicAccessDetails: "Open to the public during listed hours",
  contactInformation: null,
  sourceUrl: "https://www.openstreetmap.org/",
  verificationStatus: "PENDING",
};

describe("loginSchema", () => {
  it("normalises the email and accepts a valid login", () => {
    const result = loginSchema.safeParse({
      email: "  Admin@Example.COM ",
      password: "a long password",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("admin@example.com");
  });

  it("rejects an invalid email and an empty password", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("reportSchema", () => {
  it("accepts a valid correction and trims the description", () => {
    const result = reportSchema.safeParse({
      coolingPlaceId: "place_1",
      reportType: "OUTDATED_HOURS",
      description: "  The listed Saturday hours are no longer correct.  ",
      proposedName: null,
      proposedAddress: null,
      proposedLocalityCode: null,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.description).toContain("Saturday hours");
  });

  it("rejects a short description and an unknown report type", () => {
    expect(
      reportSchema.safeParse({
        reportType: "OTHER",
        description: "too short",
      }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({
        reportType: "NOT_A_TYPE",
        description: "This description is long enough to pass the minimum.",
      }).success,
    ).toBe(false);
  });

  it("converts empty optional text to null", () => {
    const result = reportSchema.safeParse({
      reportType: "OTHER",
      description: "This description is long enough to pass the minimum.",
      proposedName: "",
      proposedAddress: "",
      proposedLocalityCode: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proposedName).toBeNull();
      expect(result.data.proposedAddress).toBeNull();
      expect(result.data.proposedLocalityCode).toBeNull();
    }
  });
});

describe("placeCreateSchema", () => {
  it("accepts a valid record and coerces coordinates", () => {
    const result = placeCreateSchema.safeParse(validPlace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBeCloseTo(15.0286, 4);
      expect(result.data.longitude).toBeCloseTo(120.6898, 4);
      expect(result.data.amenities).toEqual(["Drinking water", "Seating"]);
    }
  });

  it("rejects malformed PSGC codes and out-of-range coordinates", () => {
    expect(placeCreateSchema.safeParse({ ...validPlace, provinceCode: "123" }).success).toBe(false);
    expect(placeCreateSchema.safeParse({ ...validPlace, localityCode: "abc" }).success).toBe(false);
    expect(placeCreateSchema.safeParse({ ...validPlace, latitude: 91 }).success).toBe(false);
    expect(placeCreateSchema.safeParse({ ...validPlace, longitude: -181 }).success).toBe(false);
  });

  it("rejects a non-http source URL", () => {
    expect(placeCreateSchema.safeParse({ ...validPlace, sourceUrl: "javascript:alert(1)" }).success).toBe(
      false,
    );
  });

  it("defaults verification to PENDING and amenities to an empty list", () => {
    const result = placeCreateSchema.safeParse({
      ...validPlace,
      verificationStatus: undefined,
      amenities: undefined,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verificationStatus).toBe("PENDING");
      expect(result.data.amenities).toEqual([]);
    }
  });

  it("limits the amenities array", () => {
    const tooMany = Array.from({ length: 21 }, (_, index) => `Amenity ${index}`);
    expect(placeCreateSchema.safeParse({ ...validPlace, amenities: tooMany }).success).toBe(false);
  });
});

describe("placeUpdateSchema", () => {
  it("accepts a partial update with a reviewer note", () => {
    const result = placeUpdateSchema.safeParse({
      verificationStatus: "VERIFIED",
      verificationNote: "Checked public access with the city librarian on 25 October 2026.",
      lastReviewedAt: "2026-10-25T10:00:00+08:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verificationStatus).toBe("VERIFIED");
      expect(result.data.lastReviewedAt).toBeInstanceOf(Date);
    }
  });

  it("rejects an invalid verification status", () => {
    expect(placeUpdateSchema.safeParse({ verificationStatus: "APPROVED" }).success).toBe(false);
  });
});

describe("verifyPlaceSchema", () => {
  it("accepts every supported status", () => {
    for (const status of ["VERIFIED", "PENDING", "TEMPORARILY_UNAVAILABLE", "CLOSED", "UNVERIFIED"]) {
      expect(verifyPlaceSchema.safeParse({ verificationStatus: status }).success).toBe(true);
    }
  });
});

describe("reportUpdateSchema", () => {
  it("accepts a moderation action and converts an empty note to null", () => {
    const result = reportUpdateSchema.safeParse({ status: "ACTIONED", moderatorNote: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.moderatorNote).toBeNull();
  });

  it("rejects an unknown queue status", () => {
    expect(reportUpdateSchema.safeParse({ status: "IGNORED" }).success).toBe(false);
  });
});

describe("alertCreateSchema", () => {
  const valid = {
    title: "Heat advisory for Central Luzon",
    description: "A verified official advisory description long enough to pass validation.",
    affectedArea: "Central Luzon (Region III)",
    severity: "WARNING",
    issuer: "DOST-PAGASA",
    issuedAt: "2026-10-25T10:00:00+08:00",
    expiresAt: "2026-10-26T10:00:00+08:00",
    sourceUrl: "https://www.pagasa.dost.gov.ph/",
  };

  it("accepts a valid advisory and coerces dates", () => {
    const result = alertCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.issuedAt).toBeInstanceOf(Date);
      expect(result.data.expiresAt).toBeInstanceOf(Date);
    }
  });

  it("rejects an expiry before the issue time", () => {
    const result = alertCreateSchema.safeParse({
      ...valid,
      expiresAt: "2026-10-24T10:00:00+08:00",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid source URL and unknown severity", () => {
    expect(alertCreateSchema.safeParse({ ...valid, sourceUrl: "not-a-url" }).success).toBe(false);
    expect(alertCreateSchema.safeParse({ ...valid, severity: "CATASTROPHIC" }).success).toBe(false);
  });
});

describe("alertUpdateSchema", () => {
  it("allows only ACTIVE, EXPIRED, or ARCHIVED", () => {
    expect(alertUpdateSchema.safeParse({ status: "EXPIRED" }).success).toBe(true);
    expect(alertUpdateSchema.safeParse({ status: "ARCHIVED" }).success).toBe(true);
    expect(alertUpdateSchema.safeParse({ status: "DELETED" }).success).toBe(false);
  });
});

describe("weatherQuerySchema", () => {
  it("coerces valid query coordinates", () => {
    const result = weatherQuerySchema.safeParse({ lat: "15.03", lon: "120.69" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lat).toBeCloseTo(15.03, 2);
      expect(result.data.lon).toBeCloseTo(120.69, 2);
    }
  });

  it("rejects coordinates outside the world", () => {
    expect(weatherQuerySchema.safeParse({ lat: "91", lon: "0" }).success).toBe(false);
    expect(weatherQuerySchema.safeParse({ lat: "0", lon: "-181" }).success).toBe(false);
  });
});

describe("placeSearchSchema", () => {
  it("applies safe defaults", () => {
    const result = placeSearchSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(24);
      expect(result.data.water).toBe(false);
    }
  });

  it("caps page size and rejects a negative page", () => {
    expect(placeSearchSchema.safeParse({ pageSize: "61" }).success).toBe(false);
    expect(placeSearchSchema.safeParse({ page: "0" }).success).toBe(false);
  });
});
