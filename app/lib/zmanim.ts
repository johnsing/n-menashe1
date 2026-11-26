import type { ComponentType } from "react";
import {
  LuClock,
  LuCloudSun,
  LuFlame,
  LuMoon,
  LuSparkles,
  LuSun,
  LuSunMedium,
  LuSunrise,
  LuSunset,
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

/** Calendar date in `timeZone` as YYYY-MM-DD (Hebcal's expected format). */
export const toApiDate = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const valueFor = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${valueFor("year")}-${valueFor("month")}-${valueFor("day")}`;
};

interface HebcalZmanimResponse {
  location?: { title?: string; tzid?: string };
  times: Record<string, string>;
}

export interface ZmanimResult {
  stations: Station[];
  locationTitle: string;
}

export async function fetchZmanim(
  dateKey: string,
  params: string,
  fallbackLabel: string,
): Promise<ZmanimResult> {
  const url = `https://www.hebcal.com/zmanim?cfg=json&${params}&date=${dateKey}`;
  const hebcalResponse = await fetch(url);
  if (!hebcalResponse.ok) {
    throw new Error(`Hebcal request failed (${hebcalResponse.status})`);
  }

  const hebcalDay = (await hebcalResponse.json()) as HebcalZmanimResponse;
  const times = hebcalDay.times ?? {};

  const stations: Station[] = ZMANIM_STATIONS.filter(
    (config) => typeof times[config.key] === "string",
  )
    .map((config) => ({
      id: config.key,
      name: config.name,
      hebrew: config.hebrew,
      time: new Date(times[config.key]),
      icon: config.icon,
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  if (stations.length === 0) {
    throw new Error("Hebcal returned no zmanim for this date");
  }

  return {
    stations,
    locationTitle: hebcalDay.location?.title ?? fallbackLabel,
  };
}

export interface ShabbatInfo {
  candleLighting: Date | null;
  havdalah: Date | null;
  parasha: string | null;
}

interface HebcalShabbatEvent {
  category?: string;
  title?: string;
  date?: string;
}

/*
 * Hebcal returns the whole Shabbat week. Only keep candle lighting or havdalah
 * when it falls on `dateKey` in the location's timezone, so the board shows
 * Friday's candles, Saturday's havdalah, and nothing extra mid-week.
 */
export async function fetchShabbat(
  params: string,
  dateKey: string,
  timeZone: string,
): Promise<ShabbatInfo> {
  const url = `https://www.hebcal.com/shabbat?cfg=json&${params}&start=${dateKey}&end=${dateKey}`;
  const hebcalResponse = await fetch(url);
  if (!hebcalResponse.ok) {
    throw new Error(`Hebcal shabbat request failed (${hebcalResponse.status})`);
  }

  const shabbatWeek = (await hebcalResponse.json()) as {
    items?: HebcalShabbatEvent[];
  };
  const events = shabbatWeek.items ?? [];

  const isOnDate = (date: Date) => toApiDate(date, timeZone) === dateKey;

  const candleEvent = events.find(
    (event) => event.category === "candles" && event.date,
  );
  const havdalahEvent = events.find(
    (event) => event.category === "havdalah" && event.date,
  );
  const parashaEvent = events.find((event) => event.category === "parashat");

  const candleDate = candleEvent?.date ? new Date(candleEvent.date) : null;
  const havdalahDate = havdalahEvent?.date
    ? new Date(havdalahEvent.date)
    : null;

  return {
    candleLighting:
      candleDate && isOnDate(candleDate) ? candleDate : null,
    havdalah: havdalahDate && isOnDate(havdalahDate) ? havdalahDate : null,
    parasha: parashaEvent?.title ?? null,
  };
}

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
