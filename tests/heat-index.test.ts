import { describe, expect, it } from "vitest";
import {
  HEAT_RISK_CATEGORIES,
  classifyHeatIndex,
  heatIndexCelsius,
  riskToneClasses,
} from "@/lib/heat-index";

describe("heatIndexCelsius", () => {
  it("returns the expected NWS/Rothfusz estimate for a known humid-hot input", () => {
    // 32.22 °C = 90 °F, 70 % RH. The NWS chart is about 105 °F / 40.6 °C.
    const result = heatIndexCelsius(32.22, 70);
    expect(result).not.toBeNull();
    expect(result!).toBeCloseTo(41.1, 1);
  });

  it("uses the low-temperature simple formula below 80 °F", () => {
    expect(heatIndexCelsius(25, 50)).toBeCloseTo(24.9, 1);
    expect(heatIndexCelsius(20, 100)).toBeCloseTo(20.3, 1);
  });

  it("calculates a plausible value for a hot, humid day in Central Luzon", () => {
    expect(heatIndexCelsius(35, 80)).toBeCloseTo(56.5, 1);
  });

  it("rejects non-finite inputs", () => {
    expect(heatIndexCelsius(Number.NaN, 70)).toBeNull();
    expect(heatIndexCelsius(32, Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("rejects relative humidity outside 1–100 %", () => {
    expect(heatIndexCelsius(32, 0)).toBeNull();
    expect(heatIndexCelsius(32, 0.9)).toBeNull();
    expect(heatIndexCelsius(32, 100.1)).toBeNull();
    expect(heatIndexCelsius(32, 1)).not.toBeNull();
    expect(heatIndexCelsius(32, 100)).not.toBeNull();
  });

  it("rejects temperatures outside the documented 20–50 °C domain", () => {
    expect(heatIndexCelsius(19.9, 70)).toBeNull();
    expect(heatIndexCelsius(50.1, 70)).toBeNull();
    expect(heatIndexCelsius(20, 70)).not.toBeNull();
    // At the upper temperature bound, low humidity stays inside the
    // physiologically plausible range used by the NWS chart.
    expect(heatIndexCelsius(50, 10)).not.toBeNull();
  });

  it("refuses to publish a physically implausible regression result", () => {
    // The polynomial fit explodes at combinations outside the NWS chart. A
    // 45 °C / 100 % RH input is not a meaningful heat-index reading.
    expect(heatIndexCelsius(45, 100)).toBeNull();
    expect(heatIndexCelsius(50, 100)).toBeNull();
  });

  it("rounds to one decimal place", () => {
    const value = heatIndexCelsius(33, 67);
    expect(value).not.toBeNull();
    expect(Math.round(value! * 10)).toBe(value! * 10);
  });
});

describe("classifyHeatIndex", () => {
  it.each([
    [null, "below_caution"],
    [undefined, "below_caution"],
    [Number.NaN, "below_caution"],
    [26.9, "below_caution"],
    [27, "caution"],
    [32, "caution"],
    [32.9, "caution"],
    [33, "extreme_caution"],
    [41, "extreme_caution"],
    [41.9, "extreme_caution"],
    [42, "danger"],
    [51, "danger"],
    [51.9, "danger"],
    [52, "extreme_danger"],
    [60, "extreme_danger"],
  ] as const)("classifies %s as %s", (value, expected) => {
    expect(classifyHeatIndex(value).level).toBe(expected);
  });

  it("uses the official PAGASA labels and ranges", () => {
    expect(HEAT_RISK_CATEGORIES.caution.rangeLabel).toBe("27–32 °C heat index");
    expect(HEAT_RISK_CATEGORIES.extreme_caution.rangeLabel).toBe("33–41 °C heat index");
    expect(HEAT_RISK_CATEGORIES.danger.rangeLabel).toBe("42–51 °C heat index");
    expect(HEAT_RISK_CATEGORIES.extreme_danger.rangeLabel).toBe("52 °C and above heat index");
  });

  it("returns guidance for every category", () => {
    for (const category of Object.values(HEAT_RISK_CATEGORIES)) {
      expect(category.guidance.length).toBeGreaterThan(0);
      expect(category.taglish.length).toBeGreaterThan(0);
      expect(riskToneClasses(category.tone)).toContain("border-");
    }
  });
});
