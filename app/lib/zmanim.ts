// app/lib/zmanim.ts — Hebcal zmanim API client + station definitions

export interface Station {
  id: string;
  name: string;
  hebrew?: string;
  time: Date;
}

/** Zmanim shown on the board, in chronological order. */
export const ZMANIM_STATIONS: { key: string; name: string; hebrew: string }[] = [
  { key: "chatzotNight",     name: "Chatzot (Midnight)",     hebrew: "חצות הלילה" },
  { key: "alotHaShachar",    name: "Alot HaShachar",         hebrew: "עלות השחר" },
  { key: "misheyakir",       name: "Misheyakir (Tallis)",    hebrew: "משיכיר" },
  { key: "sunrise",          name: "Netz — Sunrise",         hebrew: "הנץ החמה" },
  { key: "sofZmanShmaMGA",   name: "Latest Shema (MGA)",     hebrew: "סוף זמן שמע" },
  { key: "sofZmanShma",      name: "Latest Shema (Gra)",     hebrew: "סוף זמן שמע" },
  { key: "sofZmanTfillaMGA", name: "Latest Shacharit (MGA)", hebrew: "סוף זמן תפלה" },
  { key: "sofZmanTfilla",    name: "Latest Shacharit (Gra)", hebrew: "סוף זמן תפלה" },
  { key: "chatzot",          name: "Chatzot (Midday)",       hebrew: "חצות היום" },
  { key: "minchaGedola",     name: "Mincha Gedola",          hebrew: "מנחה גדולה" },
  { key: "minchaKetana",     name: "Mincha Ketana",          hebrew: "מנחה קטנה" },
  { key: "plagHaMincha",     name: "Plag HaMincha",          hebrew: "פלג המנחה" },
  { key: "sunset",           name: "Shkiah — Sunset",        hebrew: "שקיעה" },
  { key: "beinHaShmashos",   name: "Bein HaShmashos",        hebrew: "בין השמשות" },
  { key: "tzeit42min",       name: "Tzeit (42 min)",         hebrew: "צאת הכוכבים" },
  { key: "tzeit72min",       name: "Tzeit — Rabbeinu Tam",   hebrew: "ר״ת · 72 דקות" },
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
    .map((z) => ({ id: z.key, name: z.name, hebrew: z.hebrew, time: new Date(times[z.key]) }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  if (stations.length === 0) throw new Error("Hebcal returned no zmanim for this date");

  return { stations, locationTitle: data.location?.title ?? fallbackLabel };
}
