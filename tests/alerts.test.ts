import { describe, expect, it } from "vitest";
import { alertSeverityVariant, isAlertActive } from "@/lib/alerts";

const now = new Date("2026-10-25T12:00:00.000Z");

describe("isAlertActive", () => {
  it("treats an ACTIVE alert without expiry as current", () => {
    expect(isAlertActive({ status: "ACTIVE", expiresAt: null }, now)).toBe(true);
  });

  it("treats an ACTIVE alert with a future expiry as current", () => {
    expect(
      isAlertActive({ status: "ACTIVE", expiresAt: "2026-10-26T12:00:00.000Z" }, now),
    ).toBe(true);
  });

  it("treats an ACTIVE alert past its expiry as not current", () => {
    expect(
      isAlertActive({ status: "ACTIVE", expiresAt: "2026-10-24T12:00:00.000Z" }, now),
    ).toBe(false);
  });

  it("never treats EXPIRED or ARCHIVED records as current", () => {
    expect(isAlertActive({ status: "EXPIRED", expiresAt: null }, now)).toBe(false);
    expect(isAlertActive({ status: "ARCHIVED", expiresAt: null }, now)).toBe(false);
    expect(
      isAlertActive({ status: "EXPIRED", expiresAt: "2026-12-31T00:00:00.000Z" }, now),
    ).toBe(false);
  });

  it("treats an invalid expiry as not current", () => {
    expect(isAlertActive({ status: "ACTIVE", expiresAt: "not-a-date" }, now)).toBe(false);
  });

  it("accepts Date objects and ISO strings", () => {
    expect(
      isAlertActive({ status: "ACTIVE", expiresAt: new Date("2026-10-26T12:00:00.000Z") }, now),
    ).toBe(true);
    expect(
      isAlertActive({ status: "ACTIVE", expiresAt: "2026-10-26T12:00:00.000Z" }, now),
    ).toBe(true);
  });
});

describe("alertSeverityVariant", () => {
  it("maps severity to badge variants", () => {
    expect(alertSeverityVariant("INFO")).toBe("info");
    expect(alertSeverityVariant("WATCH")).toBe("warning");
    expect(alertSeverityVariant("WARNING")).toBe("warning");
    expect(alertSeverityVariant("DANGER")).toBe("danger");
    expect(alertSeverityVariant("EXTREME")).toBe("danger");
    expect(alertSeverityVariant("UNKNOWN")).toBe("secondary");
  });
});
