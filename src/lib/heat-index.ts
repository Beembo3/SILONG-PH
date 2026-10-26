/**
 * Heat-index calculation and PAGASA classification.
 *
 * The calculation uses the US National Weather Service / Rothfusz regression
 * with the documented low-humidity and high-humidity adjustments. Inputs are
 * converted from Celsius to Fahrenheit because the regression is defined in
 * Fahrenheit.
 *
 * This is an application estimate. It is NOT an official PAGASA reading.
 *
 * PAGASA categories (verified 2026-10-25 from
 * https://www.pagasa.dost.gov.ph/weather/heat-index):
 *   Caution         27–32 °C
 *   Extreme Caution 33–41 °C
 *   Danger          42–51 °C
 *   Extreme Danger  52 °C and above
 *
 * Because PAGASA publishes integer ranges with gaps (e.g. 32.1–32.9), we use
 * the lower bound of each band for continuous values: <27 below caution,
 * 27–<33 caution, 33–<42 extreme caution, 42–<52 danger, >=52 extreme danger.
 *
 * Domain: the function accepts 20–50 °C and 1–100 % relative humidity. It also
 * returns null when the polynomial result exceeds 140 °F (60 °C), because such
 * combinations are outside the NWS chart and produce implausible values.
 */

export type HeatRiskLevel =
  | "below_caution"
  | "caution"
  | "extreme_caution"
  | "danger"
  | "extreme_danger";

export interface HeatRiskCategory {
  level: HeatRiskLevel;
  label: string;
  shortLabel: string;
  rangeLabel: string;
  description: string;
  guidance: string[];
  taglish: string;
  /** Plain-language labels used in the public Taglish interface. */
  taglishLabel: string;
  taglishRangeLabel: string;
  taglishDescription: string;
  taglishGuidance: string[];
  tone: "neutral" | "yellow" | "orange" | "red" | "critical";
}

export const PAGASA_SOURCE = {
  title: "DOST-PAGASA Heat Index",
  url: "https://www.pagasa.dost.gov.ph/weather/heat-index",
  accessed: "2026-10-25",
};

export const HEAT_RISK_CATEGORIES: Record<HeatRiskLevel, HeatRiskCategory> = {
  below_caution: {
    level: "below_caution",
    label: "Below caution threshold",
    shortLabel: "Below caution",
    rangeLabel: "Below 27 °C heat index",
    description:
      "The estimated heat index is below the lowest PAGASA hazard band. Heat can still affect sensitive people, especially during direct sun or strenuous activity.",
    guidance: [
      "Drink water regularly and take breaks in the shade.",
      "Check on older adults, young children, and anyone with chronic illness.",
      "Watch for changes in official weather advisories.",
    ],
    taglish: "Hindi pa nasa hazard band ng PAGASA, pero uminom pa rin ng tubig at magpahinga sa lilim.",
    taglishLabel: "Mababa pa sa alert level",
    taglishRangeLabel: "Mababa sa 27 °C ang heat index",
    taglishDescription:
      "Mababa pa sa pinakamababang hazard band ng PAGASA ang estimated heat index. Pero puwedeng makaramdam pa rin ng init ang mga sensitibo, lalo na sa direktang araw o mabigat na gawain.",
    taglishGuidance: [
      "Uminom ng tubig nang regular at magpahinga sa lilim.",
      "Kamustahin ang matatanda, bata, at mga may sakit.",
      "Abangan ang opisyal na babala sa panahon.",
    ],
    tone: "neutral",
  },
  caution: {
    level: "caution",
    label: "Caution",
    shortLabel: "Caution",
    rangeLabel: "27–32 °C heat index",
    description:
      "Fatigue is possible with prolonged exposure and physical activity. PAGASA advises caution.",
    guidance: [
      "Take regular breaks and drink water.",
      "Limit prolonged direct sun exposure, especially at midday.",
      "Watch for weakness, dizziness, or excessive sweating.",
    ],
    taglish: "Posibleng makaramdam ng pagod. Magpahinga at uminom ng tubig nang madalas.",
    taglishLabel: "Mag-ingat",
    taglishRangeLabel: "27–32 °C ang heat index",
    taglishDescription:
      "Posibleng makaramdam ng pagod kapag matagal na nasa init o gumagawa ng mabigat na gawain. Payo ng PAGASA: mag-ingat.",
    taglishGuidance: [
      "Magpahinga nang regular at uminom ng tubig.",
      "Bawasan ang matagal na pagbibilad sa araw, lalo na sa tanghali.",
      "Abangan ang panghihina, pagkahilo, o sobrang pagpapawis.",
    ],
    tone: "yellow",
  },
  extreme_caution: {
    level: "extreme_caution",
    label: "Extreme Caution",
    shortLabel: "Extreme caution",
    rangeLabel: "33–41 °C heat index",
    description:
      "Heat cramps and heat exhaustion are possible. Continuing activity could lead to heat stroke.",
    guidance: [
      "Reduce strenuous outdoor activity, particularly between late morning and afternoon.",
      "Move to a cool or shaded place and drink water regularly.",
      "Check on vulnerable family members and neighbours.",
      "Follow school, workplace, and local government heat guidance.",
    ],
    taglish:
      "Posible ang heat cramps at pagkahapo. Bawasan ang mabigat na gawain sa labas at humanap ng malamig na lugar.",
    taglishLabel: "Sobrang mag-ingat",
    taglishRangeLabel: "33–41 °C ang heat index",
    taglishDescription:
      "Posible ang heat cramps at pagkahapo. Kung ipagpapatuloy ang mabigat na gawain, puwedeng mauwi sa heat stroke.",
    taglishGuidance: [
      "Bawasan ang mabigat na gawain sa labas, lalo na mula late morning hanggang hapon.",
      "Pumunta sa malamig o may lilim na lugar at uminom ng tubig nang regular.",
      "Kamustahin ang mga matatanda, bata, at mga may sakit.",
      "Sundin ang payo ng paaralan, trabaho, at LGU tungkol sa init.",
    ],
    tone: "orange",
  },
  danger: {
    level: "danger",
    label: "Danger",
    shortLabel: "Danger",
    rangeLabel: "42–51 °C heat index",
    description:
      "Heat cramps and heat exhaustion are likely. Heat stroke is possible with continued exposure or activity.",
    guidance: [
      "Avoid strenuous outdoor activity whenever possible.",
      "Stay in a cool, ventilated place; use cooling facilities if available.",
      "Drink water regularly unless a clinician has told you to limit fluids.",
      "Do not leave children or pets in parked vehicles.",
      "Know the warning signs of heat stroke and call emergency services if they appear.",
    ],
    taglish:
      "Mataas ang panganib. Iwasan ang mabigat na gawain sa labas. Kung may sintomas ng heat stroke, tumawag agad ng emergency help.",
    taglishLabel: "Mapanganib",
    taglishRangeLabel: "42–51 °C ang heat index",
    taglishDescription:
      "Malamang na magkaroon ng heat cramps at pagkahapo. Posible ang heat stroke kapag patuloy ang pagbibilad o mabigat na gawain.",
    taglishGuidance: [
      "Iwasan ang mabigat na gawain sa labas kung maaari.",
      "Manatili sa malamig at may bentilasyong lugar; gamitin ang cooling place kung mayroon.",
      "Uminom ng tubig nang regular maliban kung pinagbawalan ng doktor.",
      "Huwag iwanan ang bata o alagang hayop sa nakaparadang sasakyan.",
      "Alamin ang sintomas ng heat stroke at tumawag agad ng emergency help.",
    ],
    tone: "red",
  },
  extreme_danger: {
    level: "extreme_danger",
    label: "Extreme Danger",
    shortLabel: "Extreme danger",
    rangeLabel: "52 °C and above heat index",
    description:
      "Heat stroke is imminent with continued exposure. This is an emergency-level heat category.",
    guidance: [
      "Stay indoors in a cool place and avoid all non-essential outdoor activity.",
      "Check on vulnerable people and help them reach a cool place.",
      "Call emergency services immediately for confusion, fainting, hot dry skin, or collapse.",
      "Do not wait for symptoms to worsen before seeking help.",
    ],
    taglish:
      "Emergency-level ang init. Manatili sa malamig na lugar. Kung may pagkahilo, pagkawala ng malay, o sobrang init ng balat, tumawag agad ng tulong.",
    taglishLabel: "Sobrang mapanganib",
    taglishRangeLabel: "52 °C pataas ang heat index",
    taglishDescription:
      "Emergency-level ang init. Kapag patuloy ang pagbibilad, malapit nang mangyari ang heat stroke.",
    taglishGuidance: [
      "Manatili sa loob ng malamig na lugar at iwasan ang lahat ng hindi kailangang gawain sa labas.",
      "Kamustahin at tulungan ang mga matatanda, bata, at may sakit na makarating sa malamig na lugar.",
      "Tumawag agad ng emergency help kung may pagkalito, pagkawala ng malay, tuyong mainit na balat, o pagbagsak.",
      "Huwag hintayin lumala ang sintomas bago humingi ng tulong.",
    ],
    tone: "critical",
  },
};

export function heatIndexCelsius(
  temperatureC: number,
  relativeHumidity: number,
): number | null {
  if (!Number.isFinite(temperatureC) || !Number.isFinite(relativeHumidity)) return null;
  if (relativeHumidity < 1 || relativeHumidity > 100) return null;
  if (temperatureC < 20 || temperatureC > 50) return null;

  const t = (temperatureC * 9) / 5 + 32;
  const rh = relativeHumidity;

  let hiF: number;
  if (t < 80) {
    const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + rh * 0.094);
    hiF = (simple + t) / 2;
  } else {
    hiF =
      -42.379 +
      2.04901523 * t +
      10.14333127 * rh -
      0.22475541 * t * rh -
      0.00683783 * t * t -
      0.05481717 * rh * rh +
      0.00122874 * t * t * rh +
      0.00085282 * t * rh * rh -
      0.00000199 * t * t * rh * rh;

    if (rh < 13 && t >= 80 && t <= 112) {
      hiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
    } else if (rh > 85 && t >= 80 && t <= 87) {
      hiF += ((rh - 85) / 10) * ((87 - t) / 5);
    }
  }

  // The regression is a polynomial fit and becomes physically implausible at
  // extreme temperature/humidity combinations that the NWS chart does not
  // cover. Refuse to publish a value above 140 °F (60 °C) rather than showing a
  // confident-looking but meaningless number.
  if (!Number.isFinite(hiF) || hiF > 140) return null;

  return Math.round(((hiF - 32) * 5) / 9 * 10) / 10;
}

export function classifyHeatIndex(heatIndex: number | null | undefined): HeatRiskCategory {
  if (heatIndex == null || !Number.isFinite(heatIndex)) return HEAT_RISK_CATEGORIES.below_caution;
  if (heatIndex < 27) return HEAT_RISK_CATEGORIES.below_caution;
  if (heatIndex < 33) return HEAT_RISK_CATEGORIES.caution;
  if (heatIndex < 42) return HEAT_RISK_CATEGORIES.extreme_caution;
  if (heatIndex < 52) return HEAT_RISK_CATEGORIES.danger;
  return HEAT_RISK_CATEGORIES.extreme_danger;
}

export function riskToneClasses(tone: HeatRiskCategory["tone"]): string {
  switch (tone) {
    case "yellow":
      return "border-amber-300 bg-amber-50 text-amber-950";
    case "orange":
      return "border-orange-300 bg-orange-50 text-orange-950";
    case "red":
      return "border-red-300 bg-red-50 text-red-950";
    case "critical":
      return "border-red-700 bg-red-100 text-red-950";
    default:
      return "border-slate-300 bg-slate-50 text-slate-900";
  }
}
