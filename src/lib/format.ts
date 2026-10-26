const PST = "Asia/Manila";
const PST_OFFSET = "+08:00";

/**
 * Parse a date value that may come from Open-Meteo.
 *
 * Open-Meteo returns local Asia/Manila timestamps without an offset, for
 * example `2026-10-25T16:00`. `new Date()` would interpret that in the
 * runtime's local timezone, which is UTC on Vercel, shifting every displayed
 * time by eight hours and causing React hydration mismatches. Treat naive
 * date/datetime strings as Asia/Manila, and leave explicit offsets alone.
 */
function parsePstDate(input: string | number | Date): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  const value = input.trim();
  if (!value) return new Date(Number.NaN);

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00${PST_OFFSET}`);
  }

  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)) {
    return new Date(`${value.replace(" ", "T")}${PST_OFFSET}`);
  }

  return new Date(value);
}

export function formatPST(
  input: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (input == null) return "Hindi available";
  const date = parsePstDate(input);
  if (Number.isNaN(date.getTime())) return "Hindi available";
  return new Intl.DateTimeFormat("fil-PH", {
    timeZone: PST,
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}

export function formatPSTTime(input: string | number | Date | null | undefined): string {
  return formatPST(input, { dateStyle: undefined, timeStyle: "short" });
}

export function formatPSTDate(input: string | number | Date | null | undefined): string {
  return formatPST(input, { dateStyle: "medium", timeStyle: undefined });
}

export function formatDay(input: string | number | Date): string {
  const date = parsePstDate(input);
  return new Intl.DateTimeFormat("fil-PH", {
    timeZone: PST,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

const WEATHER_CONDITION_LABELS: Record<string, string> = {
  "Clear sky": "Maaliwalas ang langit",
  "Mainly clear": "Halos maaliwalas",
  "Partly cloudy": "Bahagyang maulap",
  Overcast: "Maulap",
  Fog: "May fog",
  "Depositing rime fog": "May fog na namuo",
  "Light drizzle": "Mahinang ambon",
  "Moderate drizzle": "Katamtamang ambon",
  "Dense drizzle": "Malakas na ambon",
  "Light freezing drizzle": "Mahinang nagyeyelong ambon",
  "Dense freezing drizzle": "Malakas na nagyeyelong ambon",
  "Slight rain": "Mahinang ulan",
  "Moderate rain": "Katamtamang ulan",
  "Heavy rain": "Malakas na ulan",
  "Light freezing rain": "Mahinang nagyeyelong ulan",
  "Heavy freezing rain": "Malakas na nagyeyelong ulan",
  "Slight rain showers": "Mahinang pag-ulan",
  "Moderate rain showers": "Katamtamang pag-ulan",
  "Violent rain showers": "Malakas na pag-ulan",
  "Slight snow fall": "Mahinang pag-ulan ng niyebe",
  "Moderate snow fall": "Katamtamang pag-ulan ng niyebe",
  "Heavy snow fall": "Malakas na pag-ulan ng niyebe",
  "Snow grains": "Butil ng niyebe",
  "Slight snow showers": "Mahinang pag-ulan ng niyebe",
  "Heavy snow showers": "Malakas na pag-ulan ng niyebe",
  "Thunderstorm": "Kulog at kidlat",
  "Thunderstorm with slight hail": "Kulog at kidlat na may mahinang yelo",
  "Thunderstorm with heavy hail": "Kulog at kidlat na may malakas na yelo",
  "Condition unavailable": "Hindi available ang kondisyon",
};

/** Public Taglish label for the English condition text returned by Open-Meteo. */
export function conditionLabel(condition: string | null | undefined): string {
  if (!condition) return WEATHER_CONDITION_LABELS["Condition unavailable"];
  return WEATHER_CONDITION_LABELS[condition] ?? condition;
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function relativeTime(input: string | number | Date | null | undefined): string {
  if (input == null) return "Walang oras";
  const date = parsePstDate(input);
  if (Number.isNaN(date.getTime())) return "Walang oras";
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const future = diffMs > 0;
  if (abs < 60_000) return "ngayon lang";
  const amount = (unit: number, label: string) =>
    future ? `sa loob ng ${unit} ${label}` : `${unit} ${label} ang nakalipas`;
  if (abs < 3_600_000) return amount(Math.round(abs / 60_000), "minuto");
  if (abs < 86_400_000) return amount(Math.round(abs / 3_600_000), "oras");
  return amount(Math.round(abs / 86_400_000), "araw");
}

export function pstIsoDate(input: string | number | Date): string {
  const date = parsePstDate(input);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
