// app/lib/zmanim.ts — Hebcal zmanim + shabbat API client + station definitions

import type { ComponentType } from "react";
import { 
  LuMoon, 
  LuSunrise, 
  LuSunMedium, 
  LuSun, 
  LuSunset, 
  LuCloudSun, 
  LuClock, 
  LuSparkles,
  LuFlame,
} from "react-icons/lu";

export type StationKind = "zman" | "candles" | "havdalah";

export interface Station {
  id: string;
  name: string;
  hebrew?: string;
  time: Date;
  icon: ComponentType<{ size?: number; className?: string }>;
  kind?: StationKind; // default "zman"; shabbat rows get special styling
}

interface ZmanimStationConfig {
  key: string;
  name: string;
  hebrew: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

/** Zmanim shown on the board, in chronological order, with assigned icons. */
export const ZMANIM_STATIONS: ZmanimStationConfig[] = [
  { key: "chatzotNight",     name: "Chatzot (Midnight)",     hebrew: "חצות הלילה", icon: LuMoon },
  { key: "alotHaShachar",    name: "Alot HaShachar",         hebrew: "עלות השחר", icon: LuSunrise },
  { key: "misheyakir",       name: "Misheyakir (Tallis)",    hebrew: "משיכיר", icon: LuSunMedium },
  { key: "sunrise",          name: "Netz",                   hebrew: "הנץ החמה", icon: LuSunrise },
  { key: "sofZmanShmaMGA",   name: "Latest Shema (MGA)",     hebrew: "סוף זמן שמע", icon: LuClock },
  { key: "sofZmanShma",      name: "Latest Shema (Gra)",     hebrew: "סוף זמן שמע", icon: LuClock },
  { key: "sofZmanTfillaMGA", name: "Latest Shacharit (MGA)", hebrew: "סוף זמן תפלה", icon: LuClock },
  { key: "sofZmanTfilla",    name: "Latest Shacharit (Gra)", hebrew: "סוף זמן תפלה", icon: LuClock },
  { key: "chatzot",          name: "Chatzot (Midday)",       hebrew: "חצות היום", icon: LuSun },
  { key: "minchaGedola",     name: "Mincha Gedola",          hebrew: "מנחה גדולה", icon: LuSunMedium },
  { key: "minchaKetana",     name: "Mincha Ketana",          hebrew: "מנחה קטנה", icon: LuSunMedium },
  { key: "plagHaMincha",     name: "Plag HaMincha",          hebrew: "פלג המנחה", icon: LuSunset },
  { key: "sunset",           name: "Shkiah",                 hebrew: "שקיעה", icon: LuSunset },
  { key: "beinHaShmashos",   name: "Bein HaShmashos",        hebrew: "בין השמשות", icon: LuCloudSun },
  { key: "tzeit42min",       name: "Tzeit (42 min)",         hebrew: "צאת הכוכבים", icon: LuSparkles },
  { key: "tzeit72min",       name: "Tzeit Rabbeinu Tam",     hebrew: "ר״ת · 72 דקות", icon: LuMoon },
];

/** Local calendar date in Hebcal's expected format: YYYY-MM-DD */
export const toApiDate = (d: Date): string => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

interface HebcalTimes {
  location: { title?: string };
  times: Record<string, string>;
}

export interface ZmanimResult {
  stations: Station[];
  locationTitle: string;
}

export async function fetchZmanim(
  date: Date,
  params: string,
  fallbackLabel: string,
): Promise<ZmanimResult> {
  const url = `https://www.hebcal.com/zmanim?cfg=json&${params}&date=${toApiDate(date)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hebcal request failed (${res.status})`);

  const data = (await res.json()) as HebcalTimes;
  const times = data?.times ?? {};

  const stations: Station[] = ZMANIM_STATIONS
    .filter((z) => typeof times[z.key] === "string")
    .map((z) => ({
      id: z.key,
      name: z.name,
      hebrew: z.hebrew,
      time: new Date(times[z.key]),
      icon: z.icon,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  if (stations.length === 0) throw new Error("Hebcal returned no zmanim for this date");

  return { stations, locationTitle: data.location?.title ?? fallbackLabel };
}

// ── Shabbat: candle lighting, havdalah, weekly parasha ─────

export interface ShabbatInfo {
  candleLighting: Date | null;
  havdalah: Date | null;
  parasha: string | null;
}

interface HebcalShabbatItem {
  category?: string;
  title?: string;
  date?: string;
}

/**
 * Fetches the upcoming Shabbat from Hebcal, but only returns
 * candle-lighting / havdalah times that fall ON forDate's day —
 * so on Friday you see tonight's candle lighting, on Saturday
 * tonight's havdalah, and mid-week the board stays clean.
 */
export async function fetchShabbat(
  params: string,
  forDate: Date,
): Promise<ShabbatInfo> {
  const url = `https://www.hebcal.com/shabbat?cfg=json&${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hebcal shabbat request failed (${res.status})`);

  const data = (await res.json()) as { items?: HebcalShabbatItem[] };
  const items = data?.items ?? [];

  const dayStart = new Date(forDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const inDay = (d: Date) => d >= dayStart && d < dayEnd;

  const candles = items.find((i) => i.category === "candles" && i.date);
  const havdalah = items.find((i) => i.category === "havdalah" && i.date);
  const parashaItem = items.find((i) => i.category === "parashat");

  const candleDate = candles?.date ? new Date(candles.date) : null;
  const havdalahDate = havdalah?.date ? new Date(havdalah.date) : null;

  return {
    candleLighting: candleDate && inDay(candleDate) ? candleDate : null,
    havdalah: havdalahDate && inDay(havdalahDate) ? havdalahDate : null,
    parasha: parashaItem?.title ?? null,
  };
}

/** Build the special Shabbat rows shown on the board. */
export function shabbatStations(info: ShabbatInfo): Station[] {
  const rows: Station[] = [];
  if (info.candleLighting) {
    rows.push({
      id: "candle-lighting",
      name: "Candle lighting",
      hebrew: "הדלקת נרות",
      time: info.candleLighting,
      icon: LuFlame,
      kind: "candles",
    });
  }
  if (info.havdalah) {
    rows.push({
      id: "havdalah",
      name: "Havdalah",
      hebrew: "הבדלה",
      time: info.havdalah,
      icon: LuSparkles,
      kind: "havdalah",
    });
  }
  return rows;
}
