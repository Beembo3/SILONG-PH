import { describe, expect, it } from "vitest";
import { evaluateOpenNow, parseOperatingHours } from "@/lib/places";

// Asia/Manila is UTC+8 all year.
const monday10am = new Date("2026-10-26T02:00:00.000Z");
const monday6pm = new Date("2026-10-26T10:00:00.000Z");
const saturday10am = new Date("2026-10-31T02:00:00.000Z");
const saturday1pm = new Date("2026-10-31T05:00:00.000Z");
const sunday10am = new Date("2026-11-01T02:00:00.000Z");

describe("parseOperatingHours", () => {
  it("parses weekday ranges and multiple rules", () => {
    const rules = parseOperatingHours("Mo-Fr 08:00-17:00; Sa 08:00-12:00");
    expect(rules).not.toBeNull();
    expect(rules).toHaveLength(2);
    expect(rules![0]?.days.has(1)).toBe(true); // Monday
    expect(rules![0]?.days.has(5)).toBe(true); // Friday
    expect(rules![0]?.days.has(6)).toBe(false); // Saturday
    expect(rules![1]?.days.has(6)).toBe(true);
  });

  it("parses 24/7", () => {
    const rules = parseOperatingHours("24/7");
    expect(rules).toHaveLength(1);
    expect(rules![0]?.days.size).toBe(7);
    expect(rules![0]?.windows[0]).toEqual({ start: 0, end: 1440 });
  });

  it("parses comma-separated day tokens", () => {
    const rules = parseOperatingHours("Mo,We,Fr 09:00-12:00");
    expect(rules).toHaveLength(1);
    expect([...rules![0]!.days].sort()).toEqual([1, 3, 5]);
  });

  it("returns null for missing, closed, or unsupported hours", () => {
    expect(parseOperatingHours(null)).toBeNull();
    expect(parseOperatingHours("")).toBeNull();
    expect(parseOperatingHours("closed")).toBeNull();
    expect(parseOperatingHours("sunrise-sunset")).toBeNull();
    expect(parseOperatingHours("by appointment")).toBeNull();
  });

  it("ignores malformed time tokens", () => {
    expect(parseOperatingHours("Mo-Fr 25:00-26:00")).toBeNull();
    expect(parseOperatingHours("Mo-Fr 08:00")).toBeNull();
  });
});

describe("evaluateOpenNow", () => {
  it("reports open during a weekday window", () => {
    const result = evaluateOpenNow("Mo-Fr 08:00-17:00", monday10am);
    expect(result).toEqual({
      known: true,
      open: true,
      label: "Open now (according to listed hours)",
    });
  });

  it("reports closed after the weekday window", () => {
    const result = evaluateOpenNow("Mo-Fr 08:00-17:00", monday6pm);
    expect(result.known).toBe(true);
    expect(result.open).toBe(false);
    expect(result.label).toContain("Closed");
  });

  it("reports closed on a day that is not listed", () => {
    const result = evaluateOpenNow("Mo-Fr 08:00-17:00", saturday10am);
    expect(result.open).toBe(false);
  });

  it("handles multiple rules", () => {
    expect(evaluateOpenNow("Mo-Fr 08:00-17:00; Sa 08:00-12:00", saturday10am).open).toBe(true);
    expect(evaluateOpenNow("Mo-Fr 08:00-17:00; Sa 08:00-12:00", saturday1pm).open).toBe(false);
    expect(evaluateOpenNow("Mo-Fr 08:00-17:00; Sa 08:00-12:00", sunday10am).open).toBe(false);
  });

  it("handles 24/7", () => {
    expect(evaluateOpenNow("24/7", monday10am)).toEqual({
      known: true,
      open: true,
      label: "Open 24/7",
    });
  });

  it("returns an unknown state when hours are not parseable", () => {
    expect(evaluateOpenNow(null, monday10am)).toEqual({
      known: false,
      open: null,
      label: "Operating hours not verified",
    });
    expect(evaluateOpenNow("by appointment", monday10am).known).toBe(false);
  });

  it("does not treat a closed end time as inclusive", () => {
    expect(evaluateOpenNow("Mo 08:00-17:00", new Date("2026-10-26T09:00:00.000Z")).open).toBe(false);
    expect(evaluateOpenNow("Mo 08:00-17:00", new Date("2026-10-26T08:59:00.000Z")).open).toBe(true);
  });
});
