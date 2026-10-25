const PST = "Asia/Manila";

export function formatPST(
  input: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (input == null) return "Not available";
  const date = input instanceof Date ? input : new Date(input);
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
  const date = input instanceof Date ? input : new Date(input);
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
  const date = input instanceof Date ? input : new Date(input);
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
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
