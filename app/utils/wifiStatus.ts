// app/utils/wifiStatus.ts — board status + countdown logic
// Pure functions, no React — easy to test later.

export type WifiStatus = "yellow" | "green" | "red";

const FIVE_MIN = 5 * 60_000;
const DAY = 24 * 60 * 60_000;

/**
 * yellow — event hasn't started yet (or ended over a day ago)
 * green  — ≤ 5 minutes before the event
 * red    — event just ended (within 24h)
 */
export function getWifiStatus(eventTime: Date | string, now: Date): WifiStatus {
  const diff = new Date(eventTime).getTime() - now.getTime();
  if (diff > FIVE_MIN) return "yellow";
  if (diff >= 0) return "green";
  return diff >= -DAY ? "red" : "yellow";
}

/** "7 min" · "1h 30m" · "Departed" */
export function formatCountdown(eventTime: Date | string, now: Date): string {
  const diff = new Date(eventTime).getTime() - now.getTime();
  if (diff <= 0) return "Departed";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** "in 2h 14m" — for the header's next-event line */
export function formatIn(eventTime: Date | string, now: Date): string {
  const diff = new Date(eventTime).getTime() - now.getTime();
  if (diff <= 0) return "";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}
