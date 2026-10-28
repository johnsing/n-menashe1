// app/library/parashat-data.ts — the 54 weekly Torah portions

export interface Parasha {
  slug: string;
  name: string;     // transliterated: "Bereshit"
  hebrew: string;   // "בראשית"
  book: string;     // book slug: "genesis"
  ref: string;      // Sefaria range: "Genesis.1.1-6.8"
  range: string;    // display: "Genesis 1:1–6:8"
}

export const PARASHIYOT: Parasha[] = [
  // ── Genesis / Bereshit (12) ──
  { slug: "bereshit",      name: "Bereshit",       hebrew: "בראשית",     book: "genesis", ref: "Genesis.1.1-6.8",      range: "Genesis 1:1-6:8" },
  { slug: "noach",         name: "Noach",          hebrew: "נח",         book: "genesis", ref: "Genesis.6.9-11.32",    range: "Genesis 6:9–11:32" },
  { slug: "lech-lecha",    name: "Lech-Lecha",     hebrew: "לך לך",      book: "genesis", ref: "Genesis.12.1-17.27",   range: "Genesis 12:1–17:27" },
  { slug: "vayera",        name: "Vayera",         hebrew: "וירא",       book: "genesis", ref: "Genesis.18.1-22.24",   range: "Genesis 18:1–22:24" },
  { slug: "chayei-sarah",  name: "Chayei Sarah",   hebrew: "חיי שרה",    book: "genesis", ref: "Genesis.23.1-25.18",   range: "Genesis 23:1–25:18" },
  { slug: "toldot",        name: "Toldot",         hebrew: "תולדות",     book: "genesis", ref: "Genesis.25.19-28.9",   range: "Genesis 25:19–28:9" },
  { slug: "vayetzei",      name: "Vayetzei",       hebrew: "ויצא",       book: "genesis", ref: "Genesis.28.10-32.3",   range: "Genesis 28:10–32:3" },
  { slug: "vayishlach",    name: "Vayishlach",     hebrew: "וישלח",      book: "genesis", ref: "Genesis.32.4-36.43",   range: "Genesis 32:4–36:43" },
  { slug: "vayeshev",      name: "Vayeshev",       hebrew: "וישב",       book: "genesis", ref: "Genesis.37.1-40.23",   range: "Genesis 37:1–40:23" },
  { slug: "miketz",        name: "Miketz",         hebrew: "מקץ",        book: "genesis", ref: "Genesis.41.1-44.17",   range: "Genesis 41:1–44:17" },
  { slug: "vayigash",      name: "Vayigash",       hebrew: "ויגש",       book: "genesis", ref: "Genesis.44.18-47.27",  range: "Genesis 44:18–47:27" },
  { slug: "vayechi",       name: "Vayechi",        hebrew: "ויחי",       book: "genesis", ref: "Genesis.47.28-50.26",  range: "Genesis 47:28–50:26" },
  // ── Exodus / Shemot (11) ──
  { slug: "shemot",        name: "Shemot",         hebrew: "שמות",       book: "exodus",  ref: "Exodus.1.1-6.1",       range: "Exodus 1:1–6:1" },
  { slug: "vaera",         name: "Vaera",          hebrew: "וארא",       book: "exodus",  ref: "Exodus.6.2-9.35",      range: "Exodus 6:2–9:35" },
  { slug: "bo",            name: "Bo",             hebrew: "בא",         book: "exodus",  ref: "Exodus.10.1-13.16",    range: "Exodus 10:1–13:16" },
  { slug: "beshalach",     name: "Beshalach",      hebrew: "בשלח",       book: "exodus",  ref: "Exodus.13.17-17.16",   range: "Exodus 13:17–17:16" },
  { slug: "yitro",         name: "Yitro",          hebrew: "יתרו",       book: "exodus",  ref: "Exodus.18.1-20.23",    range: "Exodus 18:1–20:23" },
  { slug: "mishpatim",     name: "Mishpatim",      hebrew: "משפטים",     book: "exodus",  ref: "Exodus.21.1-24.18",    range: "Exodus 21:1–24:18" },
  { slug: "terumah",       name: "Terumah",        hebrew: "תרומה",      book: "exodus",  ref: "Exodus.25.1-27.19",    range: "Exodus 25:1–27:19" },
  { slug: "tetzaveh",      name: "Tetzaveh",       hebrew: "תצוה",       book: "exodus",  ref: "Exodus.27.20-30.10",   range: "Exodus 27:20–30:10" },
  { slug: "ki-tisa",       name: "Ki Tisa",        hebrew: "כי תשא",     book: "exodus",  ref: "Exodus.30.11-34.35",   range: "Exodus 30:11–34:35" },
  { slug: "vayakhel",      name: "Vayakhel",       hebrew: "ויקהל",      book: "exodus",  ref: "Exodus.35.1-38.20",    range: "Exodus 35:1–38:20" },
  { slug: "pekudei",       name: "Pekudei",        hebrew: "פקודי",      book: "exodus",  ref: "Exodus.38.21-40.38",   range: "Exodus 38:21–40:38" },
  // ── Leviticus / Vayikra (10) ──
  { slug: "vayikra",       name: "Vayikra",        hebrew: "ויקרא",      book: "leviticus", ref: "Leviticus.1.1-5.26",   range: "Leviticus 1:1–5:26" },
  { slug: "tzav",          name: "Tzav",           hebrew: "צו",         book: "leviticus", ref: "Leviticus.6.1-8.36",   range: "Leviticus 6:1–8:36" },
  { slug: "shemini",       name: "Shemini",        hebrew: "שמיני",      book: "leviticus", ref: "Leviticus.9.1-11.47",  range: "Leviticus 9:1–11:47" },
  { slug: "tazria",        name: "Tazria",         hebrew: "תזריע",      book: "leviticus", ref: "Leviticus.12.1-13.59", range: "Leviticus 12:1–13:59" },
  { slug: "metzora",       name: "Metzora",        hebrew: "מצורע",      book: "leviticus", ref: "Leviticus.14.1-15.33", range: "Leviticus 14:1–15:33" },
  { slug: "acharei-mot",   name: "Acharei Mot",    hebrew: "אחרי מות",   book: "leviticus", ref: "Leviticus.16.1-18.30", range: "Leviticus 16:1–18:30" },
  { slug: "kedoshim",      name: "Kedoshim",       hebrew: "קדושים",     book: "leviticus", ref: "Leviticus.19.1-20.27", range: "Leviticus 19:1–20:27" },
  { slug: "emor",          name: "Emor",           hebrew: "אמור",       book: "leviticus", ref: "Leviticus.21.1-24.23", range: "Leviticus 21:1–24:23" },
  { slug: "behar",         name: "Behar",          hebrew: "בהר",        book: "leviticus", ref: "Leviticus.25.1-26.2",  range: "Leviticus 25:1–26:2" },
  { slug: "bechukotai",    name: "Bechukotai",     hebrew: "בחוקותי",    book: "leviticus", ref: "Leviticus.26.3-27.34", range: "Leviticus 26:3–27:34" },
  // ── Numbers / Bemidbar (10) ──
  { slug: "bemidbar",      name: "Bemidbar",       hebrew: "במדבר",      book: "numbers", ref: "Numbers.1.1-4.20",     range: "Numbers 1:1–4:20" },
  { slug: "nasso",         name: "Nasso",          hebrew: "נשא",        book: "numbers", ref: "Numbers.4.21-7.89",    range: "Numbers 4:21–7:89" },
  { slug: "behaalotcha",   name: "Behaalotcha",    hebrew: "בהעלותך",    book: "numbers", ref: "Numbers.8.1-12.16",    range: "Numbers 8:1–12:16" },
  { slug: "shelach",       name: "Shelach",        hebrew: "שלח",        book: "numbers", ref: "Numbers.13.1-15.41",   range: "Numbers 13:1–15:41" },
  { slug: "korach",        name: "Korach",         hebrew: "קרח",        book: "numbers", ref: "Numbers.16.1-18.32",   range: "Numbers 16:1–18:32" },
  { slug: "chukat",        name: "Chukat",         hebrew: "חוקת",       book: "numbers", ref: "Numbers.19.1-22.1",    range: "Numbers 19:1–22:1" },
  { slug: "balak",         name: "Balak",          hebrew: "בלק",        book: "numbers", ref: "Numbers.22.2-25.9",    range: "Numbers 22:2–25:9" },
  { slug: "pinchas",       name: "Pinchas",        hebrew: "פנחס",       book: "numbers", ref: "Numbers.25.10-30.1",   range: "Numbers 25:10–30:1" },
  { slug: "matot",         name: "Matot",          hebrew: "מטות",       book: "numbers", ref: "Numbers.30.2-32.42",   range: "Numbers 30:2–32:42" },
  { slug: "masei",         name: "Masei",          hebrew: "מסעי",       book: "numbers", ref: "Numbers.33.1-36.13",   range: "Numbers 33:1–36:13" },
  // ── Deuteronomy / Devarim (11) ──
  { slug: "devarim",       name: "Devarim",        hebrew: "דברים",      book: "deuteronomy", ref: "Deuteronomy.1.1-3.22",  range: "Deuteronomy 1:1–3:22" },
  { slug: "vaetchanan",    name: "Va'etchanan",    hebrew: "ואתחנן",     book: "deuteronomy", ref: "Deuteronomy.3.23-7.11", range: "Deuteronomy 3:23–7:11" },
  { slug: "eikev",         name: "Eikev",          hebrew: "עקב",        book: "deuteronomy", ref: "Deuteronomy.7.12-11.25", range: "Deuteronomy 7:12–11:25" },
  { slug: "reeh",          name: "Re'eh",          hebrew: "ראה",        book: "deuteronomy", ref: "Deuteronomy.11.26-16.17", range: "Deuteronomy 11:26–16:17" },
  { slug: "shoftim",       name: "Shoftim",        hebrew: "שופטים",     book: "deuteronomy", ref: "Deuteronomy.16.18-21.9", range: "Deuteronomy 16:18–21:9" },
  { slug: "ki-teitzei",    name: "Ki Teitzei",     hebrew: "כי תצא",     book: "deuteronomy", ref: "Deuteronomy.21.10-25.19", range: "Deuteronomy 21:10–25:19" },
  { slug: "ki-tavo",       name: "Ki Tavo",        hebrew: "כי תבוא",    book: "deuteronomy", ref: "Deuteronomy.26.1-29.8",  range: "Deuteronomy 26:1–29:8" },
  { slug: "nitzavim",      name: "Nitzavim",       hebrew: "ניצבים",     book: "deuteronomy", ref: "Deuteronomy.29.9-30.20", range: "Deuteronomy 29:9–30:20" },
  { slug: "vayelech",      name: "Vayelech",       hebrew: "וילך",       book: "deuteronomy", ref: "Deuteronomy.31.1-31.30", range: "Deuteronomy 31:1–31:30" },
  { slug: "haazinu",       name: "Ha'azinu",       hebrew: "האזינו",     book: "deuteronomy", ref: "Deuteronomy.32.1-32.52", range: "Deuteronomy 32:1–32:52" },
  { slug: "vezot-haberakhah", name: "Vezot Haberakhah", hebrew: "וזאת הברכה", book: "deuteronomy", ref: "Deuteronomy.33.1-34.12", range: "Deuteronomy 33:1–34:12" },
];

export const getParasha = (slug: string) =>
  PARASHIYOT.find((p) => p.slug === slug);

export const parashiyotByBook = (book: string) =>
  PARASHIYOT.filter((p) => p.book === book);

/** "bereshit" → 0, used for prev/next navigation */
export const parashaIndex = (slug: string) =>
  PARASHIYOT.findIndex((p) => p.slug === slug);

/** Normalize names for matching Hebcal output, e.g. "Lech-Lecha" ↔ "LechLecha" */
export const normalizeName = (s: string) =>
  s.toLowerCase().replace(/[\s\-'’]/g, "");
