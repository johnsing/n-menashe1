// app/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";

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

const zmanimWanted = [
  { key: "alotHaShachar", name: "Alot HaShachar (Dawn)" },
  { key: "sunrise", name: "Netz — Sunrise" },
  { key: "sofZmanShma", name: "Latest Shema (Gra)" },
  { key: "sofZmanTfilla", name: "Latest Shacharit (Gra)" },
  { key: "chatzot", name: "Chatzot (Midday)" },
  { key: "minchaGedola", name: "Mincha Gedola" },
  { key: "plagHaMincha", name: "Plag HaMincha" },
  { key: "sunset", name: "Shkiah — Sunset" },
  { key: "tzeit72min", name: "Tzeit — Nightfall (72 min)" },
];

interface Zman {
  name: string;
  time: Date;
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

export default function CalendarPage() {
  const [city, setCity] = useState(cities[0]); // starts on Jerusalem
  const [zmanim, setZmanim] = useState<Zman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  // Bump this to retry — the effect below is the single source of fetching.
  const [retryCount, setRetryCount] = useState(0);

  // Live clock: set `now` every 30 seconds so countdowns stay fresh
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer); // cleanup when leaving the page
  }, []);

  // Fetch times — runs on load, on city change, and on manual retries,
  // because all three are in the dependency array.
  useEffect(() => {
    // AbortController: if the city changes mid-flight, cancel the old request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s cap

    async function loadZmanim() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.hebcal.com/zmanim?cfg=json&geonameid=${city.id}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Hebcal didn't answer");

        const data = await response.json();

        const list: Zman[] = [];
        for (const wanted of zmanimWanted) {
          const rawTime = data.times[wanted.key];
          if (rawTime) {
            list.push({ name: wanted.name, time: new Date(rawTime) });
          }
        }
        setZmanim(list);
      } catch (err) {
        // Aborted because the city changed? That's not an error — the new
        // fetch already replaced us. Only surface real failures.
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    loadZmanim();
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [city, retryCount]); // ← re-runs whenever the city changes or user retries

  // The first zman in the list that's still in the future
  const nextZman = now
    ? zmanim.find((z) => z.time.getTime() > now.getTime())
    : undefined;

  return (
    <main className="container">
      <header className="hero">
        <h1>Zmanim</h1>
        <p className="muted">
          {now
            ? now.toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : ""}
        </p>
      </header>

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

      {loading && <p className="loading-note">Loading times…</p>}

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

      {!loading && !error && (
        <div className="stack">
          {zmanim.map((zman) => {
            const isNext = zman === nextZman;
            return (
              <div
                key={zman.name}
                className={isNext ? "card zman-row is-next" : "card zman-row"}
              >
                <span>
                  {zman.name}
                  {isNext && <span className="next-badge">Next</span>}
                </span>
                <span className="zman-times">
                  <strong>
                    {zman.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                  {now && (
                    <small className="muted">{countdown(zman.time, now)}</small>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
