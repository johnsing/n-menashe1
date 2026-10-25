// app/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";

// Which zmanim to show, in the order we want them on screen.
// The keys come from Hebcal's API response (their docs list all of them).
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

// One row of the final list: a name + a real Date object
interface Zman {
  name: string;
  time: Date;
}

export default function CalendarPage() {
  const [zmanim, setZmanim] = useState<Zman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadZmanim() {
      try {
        const response = await fetch(
          "https://www.hebcal.com/zmanim?cfg=json&geonameid=281184",
        );
        if (!response.ok) throw new Error("Hebcal didn't answer");

        const data = await response.json();

        // Turn the API's raw strings into clean { name, time } rows,
        // skipping any zman the API didn't return today.
        const list: Zman[] = [];
        for (const wanted of zmanimWanted) {
          const rawTime = data.times[wanted.key];
          if (rawTime) {
            list.push({ name: wanted.name, time: new Date(rawTime) });
          }
        }

        setZmanim(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false); // runs whether it worked or failed
      }
    }

    loadZmanim();
  }, []); // [] = run once, when the page loads

  return (
    <main className="container">
      <header className="hero">
        <h1>Zmanim</h1>
        <p className="muted">Jerusalem · today</p>
      </header>

      {loading && <p className="muted">Loading times…</p>}

      {error && (
        <p style={{ color: "#ff8080" }}>
          Couldn’t load the times ({error}). Check your internet and refresh.
        </p>
      )}

      {!loading && !error && (
        <div className="stack">
          {zmanim.map((zman) => (
            <div key={zman.name} className="card zman-row">
              <span>{zman.name}</span>
              <strong>
                {zman.time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}