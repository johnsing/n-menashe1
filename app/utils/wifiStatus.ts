export type WifiStatus = "yellow" | "green" | "red";

const FIVE_MINUTES = 5 * 60_000;
const DAY = 24 * 60 * 60_000;

export function getWifiStatus(
  eventTime: Date | string,
  now: Date,
): WifiStatus {
  const remaining = new Date(eventTime).getTime() - now.getTime();

  if (remaining > FIVE_MINUTES) return "yellow";
  if (remaining >= 0) return "green";
  return remaining >= -DAY ? "red" : "yellow";
}

function formatRemaining(eventTime: Date | string, now: Date) {
  const remaining = new Date(eventTime).getTime() - now.getTime();
  if (remaining <= 0) return null;

  const minutes = Math.round(remaining / 60_000);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function formatCountdown(
  eventTime: Date | string,
  now: Date,
): string {
  return formatRemaining(eventTime, now) ?? "Departed";
}

export function formatIn(eventTime: Date | string, now: Date): string {
  const remaining = formatRemaining(eventTime, now);
  return remaining ? `in ${remaining}` : "";
}
