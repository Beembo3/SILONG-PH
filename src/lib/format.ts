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
  if (input == null) return "Not available";
  const date = parsePstDate(input);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-PH", {
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
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PST,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function relativeTime(input: string | number | Date | null | undefined): string {
  if (input == null) return "Unknown time";
  const date = parsePstDate(input);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  return rtf.format(Math.round(diffMs / 86_400_000), "day");
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
