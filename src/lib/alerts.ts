export const ALERT_STATUSES = ["ACTIVE", "EXPIRED", "ARCHIVED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const ALERT_SEVERITIES = ["INFO", "WATCH", "WARNING", "DANGER", "EXTREME"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export interface AlertLike {
  status: string;
  expiresAt: Date | string | null;
}

/**
 * An official alert is publicly active only when its recorded status is ACTIVE
 * and it has not passed its optional expiry. An expired-by-time record is not
 * silently shown as current.
 */
export function isAlertActive(alert: AlertLike, now = new Date()): boolean {
  if (alert.status !== "ACTIVE") return false;
  if (!alert.expiresAt) return true;
  const expiry =
    alert.expiresAt instanceof Date ? alert.expiresAt : new Date(alert.expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry > now;
}

export function alertSeverityVariant(
  severity: string,
): "info" | "warning" | "danger" | "secondary" {
  switch (severity) {
    case "INFO":
      return "info";
    case "WATCH":
    case "WARNING":
      return "warning";
    case "DANGER":
    case "EXTREME":
      return "danger";
    default:
      return "secondary";
  }
}
