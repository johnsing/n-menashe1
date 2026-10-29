// app/audio/tracks.ts — the ONLY file you edit to add real content later.
// Replace each `src` with a direct MP3 URL (your own hosting, or a shiur
// site that allows hotlinking). Everything else updates automatically.

export interface Track {
  id: string;
  title: string;
  artist: string;
  category: string;
  src: string;
  color: string; // cover tile base color
}

export const CATEGORIES = [
  "Shiurim",
  "Tefillah & Tunes",
  "Tehillim",
  "Chagim",
] as const;

export const TRACKS: Track[] = [
  // ── Shiurim ──
  { id: "shacharit-halacha", title: "Daily Shacharit & Halacha Briefing", artist: "N-Menashe Beit Midrash", category: "Shiurim", src: "", color: "#7c3aed" },
  { id: "parsha-insights",   title: "Weekly Parsha Insights & Shiur",      artist: "N-Menashe Beit Midrash", category: "Shiurim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color: "#2563eb" },
  { id: "mishnah-daily",     title: "Mishnah Yomit — One Chapter a Day", artist: "N-Menashe Beit Midrash", category: "Shiurim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", color: "#0891b2" },
  { id: "daf-yomi",          title: "Daf Yomi Highlights",                 artist: "Guest Maggid Shiur",     category: "Shiurim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", color: "#059669" },

  // ── Tefillah & Tunes ──
  { id: "shacharit-nusach",  title: "Shacharit — Weekday Nusach",          artist: "Community Chazan",       category: "Tefillah & Tunes", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", color: "#d97706" },
  { id: "kabbalat-shabbat",  title: "Kabbalat Shabbat Melodies",           artist: "Community Chazan",       category: "Tefillah & Tunes", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", color: "#dc2626" },
  { id: "havdalah",          title: "Havdalah & Motzaei Shabbat",          artist: "Community Chazan",       category: "Tefillah & Tunes", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", color: "#9333ea" },

  // ── Tehillim ──
  { id: "tehillim-hard",     title: "Tehillim for Difficult Times",        artist: "N-Menashe Tehillim Group", category: "Tehillim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", color: "#db2777" },
  { id: "tehillim-shabbat",  title: "Tehillim of Shabbat & Yom Tov",       artist: "N-Menashe Tehillim Group", category: "Tehillim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", color: "#ea580c" },

  // ── Chagim ──
  { id: "seder-high-holidays", title: "Seder of Rosh Hashana & Yom Kippur", artist: "Holiday Series",        category: "Chagim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", color: "#65a30d" },
  { id: "seder-pesach",        title: "Pesach Seder Companion",           artist: "Holiday Series",        category: "Chagim", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color: "#0d9488" },
];

export const tracksByCategory = (category: string) =>
  TRACKS.filter((t) => t.category === category);
