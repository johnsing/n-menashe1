// app/calendar/page.tsx — Zmanim train timetable
"use client";

import { useEffect, useMemo, useState } from "react";

const cities = [
  { id: "281184", name: "Jerusalem" },
  { id: "293397", name: "Tel Aviv" },
  { id: "294801", name: "Haifa" },
  { id: "293100", name: "Tzfat" },
  { id: "293322", name: "Tiberias" },
  { id: "294098", name: "Nazareth" },
  { id: "295530", name: "Be'er Sheva" },
  { id: "295629", name: "Ashdod" },
  { id: "295620", name: "Ashkelon" },
  { id: "295277", name: "Eilat" },
];

interface TrainStop {
  key: string;
  name: string;
  hebrew: string;
}

interface TrainGroup {
  label: string;
  stops: TrainStop[];
}

// The main board — grouped like a train timetable: night line, morning line…
const BOARD_GROUPS: TrainGroup[] = [
  {
    label: "Night & Dawn",
    stops: [
      { key: "chatzotNight", name: "Midnight — Chatzot", hebrew: "חצות הלילה" },
      { key: "alotHaShachar", name: "Alot haShachar — Dawn", hebrew: "עלות השחר" },
      { key: "misheyakir", name: "Earliest talis & tefillin", hebrew: "משיכיר" },
      { key: "misheyakirMachmir", name: "Misheyakir Machmir", hebrew: "משיכיר מחמיר" },
      { key: "dawn", name: "Civil dawn", hebrew: "שחר" },
    ],
  },
  {
    label: "Morning",
    stops: [
      { key: "sunrise", name: "Sunrise — Netz", hebrew: "הנץ החמה" },
      { key: "sofZmanShmaMGA", name: "Latest Shema (MGA)", hebrew: "סוף זמן ק״ש מג״א" },
      { key: "sofZmanShma", name: "Latest Shema (Gra)", hebrew: "סוף זמן ק״ש גר״א" },
      { key: "sofZmanTfillaMGA", name: "Latest Shacharit (MGA)", hebrew: "סוף זמן תפלה מג״א" },
      { key: "sofZmanTfilla", name: "Latest Shacharit (Gra)", hebrew: "סוף זמן תפלה גר״א" },
      { key: "chatzot", name: "Chatzot — Midday", hebrew: "חצות היום" },
    ],
  },
  {
    label: "Afternoon",
    stops: [
      { key: "minchaGedola", name: "Mincha Gedola", hebrew: "מנחה גדולה" },
      { key: "minchaKetana", name: "Mincha Ketana", hebrew: "מנחה קטנה" },
      { key: "plagHaMincha", name: "Plag haMincha", hebrew: "פלג המנחה" },
    ],
  },
  {
    label: "Evening & Night",
    stops: [
      { key: "sunset", name: "Sunset — Shkiah", hebrew: "שקיעה" },
      { key: "dusk", name: "Civil dusk", hebrew: "דמדומים" },
      { key: "beinHaShmashos", name: "Bein haShmashot", hebrew: "בין השמשות" },
      { key: "tzeit7083deg", name: "Nightfall — 3 medium stars", hebrew: "צאת הכוכבים" },
      { key: "tzeit85deg", name: "Nightfall — 3 small stars", hebrew: "צאת הכוכבים" },
      { key: "tzeit42min", name: "Nightfall — 42 min", hebrew: "צאת הכוכבים" },
      { key: "tzeit50min", name: "Nightfall — 50 min", hebrew: "צאת הכוכבים" },
      { key: "tzeit72min", name: "Nightfall — 72 min · Rabbeinu Tam", hebrew: "צאת הכוכבים" },
    ],
  },
];

// Extra times, revealed with the "show all" toggle
const EXTRA_GROUP: TrainGroup = {
  label: "Baal HaTanya Times",
  stops: [
    { key: "alosBaalHatanya", name: "Alot HaShachar", hebrew: "עלות השחר" },
    { key: "sofZmanShmaBaalHatanya", name: "Latest Shema", hebrew: "סוף זמן ק״ש" },
    { key: "sofZmanTfilaBaalHatanya", name: "Latest Shacharit", hebrew: "סוף זמן תפלה" },
    { key: "minchaGedolaBaalHatanya", name: "Mincha Gedola", hebrew: "מנחה גדולה" },
    { key: "minchaKetanaBaalHatanya", name: "Mincha Ketana", hebrew: "מנחה קטנה" },
    { key: "plagHaminchaBaalHatanya", name: "Plag HaMincha", hebrew: "פלג המנחה" },
    { key: "tzaisBaalHatanya", name: "Tzeit", hebrew: "צאת הכוכבים" },
  ],
};

// Columns of the 7-day timetable
const WEEK_COLUMNS: { key: string; label: string }[] = [
  { key: "alotHaShachar", label: "Dawn" },
  { key: "sunrise", label: "Sunrise" },
  { key: "sofZmanShma", label: "Shema" },
  { key: "minchaGedola", label: "Mincha" },
  { key: "sunset", label: "Sunset" },
  { key: "tzeit42min", label: "Night 42" },
  { key: "tzeit72min", label: "Night 72" },
];

interface DayData {
  date: string; // "2026-10-25"
  times: Record<string, string>;
}

type ViewMode = "today" | "week";

/** Local calendar date → YYYY-MM-DD (what Hebcal expects) */
function toApiDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// "in 47 min" / "2h 10m" / "Departed"
function countdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Departed";
  const totalMin = Math.ceil(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function CalendarPage() {
  const [city, setCity] = useState(cities[0]); // starts on Jerusalem
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [view, setView] = useState<ViewMode>("today");
  const [showAll, setShowAll] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Live clock: set `now` every 30 seconds so countdowns stay fresh
  useEffect(() => {
    const initialUpdate = setTimeout(() => setNow(new Date()), 0);
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, []);

  // One request fetches the whole week (start..end). Today = days[0].
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const start = new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // 7-day timetable

        const url =
          `https://www.hebcal.com/zmanim?cfg=json&geonameid=${city.id}` +
          `&start=${toApiDate(start)}&end=${toApiDate(end)}`;

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Hebcal didn't answer");

        const data = await response.json();
        // Range requests return an array; a single-date request returns one object
        const list: DayData[] = (Array.isArray(data) ? data : [data]).map(
          (d) => ({ date: d.date, times: d.times ?? {} }),
        );
        setDays(list);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    load();
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [city, retryCount]);

  const today: DayData | null = days[0] ?? null;

  const groups = useMemo(
    () => (showAll ? [...BOARD_GROUPS, EXTRA_GROUP] : BOARD_GROUPS),
    [showAll],
  );

  // The first stop of the day still in the future
  const nextKey = useMemo(() => {
    if (!now || !today) return null;
    for (const g of groups) {
      for (const s of g.stops) {
        const raw = today.times[s.key];
        if (raw && new Date(raw).getTime() > now.getTime()) return s.key;
      }
    }
    return null;
  }, [now, today, groups]);

  return (
    <main className="container">
      <div className="city-picker">
        <label htmlFor="city" className="muted">
          City
        </label>
        <select
          id="city"
          className="select"
          value={city.id}
          onChange={(e) =>
            setCity(cities.find((c) => c.id === e.target.value) ?? cities[0])
          }
        >
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Today / 7-Day view toggle */}
      <div className="view-toggle" role="tablist" aria-label="Timetable view">
        <button
          type="button"
          role="tab"
          aria-selected={view === "today"}
          className={view === "today" ? "toggle-btn is-active" : "toggle-btn"}
          onClick={() => setView("today")}
        >
          Today
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "week"}
          className={view === "week" ? "toggle-btn is-active" : "toggle-btn"}
          onClick={() => setView("week")}
        >
          7-Day
        </button>
      </div>

      {loading && <p className="loading-note">Loading timetable…</p>}

      {error && (
        <p className="error-note" role="alert">
          Couldn’t load the times ({error}). Check your internet and try again.
          <br />
          <button
            type="button"
            className="btn"
            onClick={() => setRetryCount((c) => c + 1)}
          >
            Try again
          </button>
        </p>
      )}

      {/* ── TODAY: departure board ─────────────────────────── */}
      {!loading && !error && view === "today" && today && (
        <section className="board" aria-label="Today's zmanim">
          <div className="board-head">
            <div>
              <div className="station">N-Menashe Central</div>
              <div className="board-sub">
                {city.name} ·{" "}
                {now
                  ? now.toLocaleDateString([], {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : today.date}
              </div>
            </div>
            <div className="board-clock">
              {now ? fmtTime(now) : "--:--"}
            </div>
          </div>

          {groups.map((group) => {
            const stops = group.stops.filter((s) => today.times[s.key]);
            if (stops.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="board-group-label">{group.label}</div>
                {stops.map((stop) => {
                  const time = new Date(today.times[stop.key]);
                  const isNext = stop.key === nextKey;
                  const isPast = now ? time.getTime() <= now.getTime() : false;
                  const cd = now ? countdown(time, now) : "";
                  const soon =
                    now !== null &&
                    !isPast &&
                    time.getTime() - now.getTime() <= 5 * 60_000;

                  return (
                    <div
                      key={stop.key}
                      className={
                        "train-row" +
                        (isNext ? " next" : "") +
                        (isPast ? " past" : "")
                      }
                    >
                      <span className="train-no" aria-hidden="true">
                        {fmtTime(time)}
                      </span>
                      <span className="train-name">
                        <strong>
                          {stop.name}
                          {isNext && <span className="next-badge">Next</span>}
                        </strong>
                        <small lang="he">{stop.hebrew}</small>
                      </span>
                      <span className="train-countdown">
                        <span
                          className={
                            "train-count" +
                            (isPast
                              ? " departed"
                              : soon
                                ? " soon"
                                : " future")
                          }
                        >
                          {isPast ? "Departed" : cd}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <button
            type="button"
            className="show-all"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
          >
            {showAll ? "− Show fewer times" : "+ Show all times (incl. Baal HaTanya)"}
          </button>
        </section>
      )}

      {/* ── 7-DAY: classic timetable table ─────────────────── */}
      {!loading && !error && view === "week" && (
        <section className="board" aria-label="7-day zmanim timetable">
          <div className="board-head">
            <div>
              <div className="station">Weekly Timetable</div>
              <div className="board-sub">{city.name}</div>
            </div>
          </div>
          <div className="board-scroll">
            <table className="week-table">
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  {WEEK_COLUMNS.map((col) => (
                    <th key={col.key} scope="col">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => {
                  const date = new Date(`${d.date}T00:00:00`);
                  return (
                    <tr key={d.date} className={i === 0 ? "today" : ""}>
                      <td>
                        {date.toLocaleDateString([], {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      {WEEK_COLUMNS.map((col) => (
                        <td key={col.key}>
                          {d.times[col.key]
                            ? fmtTime(new Date(d.times[col.key]))
                            : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
