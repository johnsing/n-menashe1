"use client";
// "This week's parasha" card — computed locally with @hebcal/core
// (no network, works offline). Re-checks every minute so a tab left
// open across the weekend rolls over to the new portion by itself.
// On holidays (no regular portion) shows the holiday name instead
// of vanishing.
import { useEffect, useState } from "react";
import Link from "next/link";
import { HDate, getSedra } from "@hebcal/core";
import { PARASHIYOT, normalizeName } from "@/app/data/parashat-data";

interface ParashaCard {
  kind: "parasha" | "chag";
  portions: (typeof PARASHIYOT)[number][]; // empty for chag
  holiday: string;                           // "" for parasha
}

function compute(): ParashaCard | null {
  const date = new HDate();
  const reading = getSedra(date.getFullYear(), false).lookup(date);

  if (reading.chag) {
    return {
      kind: "chag",
      portions: [],
      holiday: reading.parsha?.join(" ") || "Yom Tov",
    };
  }

  const matches = (reading.parsha ?? [])
    .map((n) =>
      PARASHIYOT.find((p) => normalizeName(p.name) === normalizeName(n)),
    )
    .filter((p): p is (typeof PARASHIYOT)[number] => Boolean(p));

  return matches.length > 0
    ? { kind: "parasha", portions: matches, holiday: "" }
    : null;
}

export default function ParashaThisWeek() {
  const [current, setCurrent] = useState<ParashaCard | null>(() => compute());

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => {
        const next = compute();
        // Skip re-render when nothing changed (stable reference)
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!current) return null;

  if (current.kind === "chag") {
    return (
      <section className="parasha-week card">
        <div className="parasha-week-label">This week</div>
        <div className="parasha-week-names">
          <div className="parasha-week-name">
            <strong>{current.holiday}</strong>
          </div>
        </div>
      </section>
    );
  }

  const isDouble = current.portions.length > 1;

  return (
    <section className="parasha-week card">
      <div className="parasha-week-label">
        {isDouble ? "This week's parashiyot" : "This week's parasha"}
      </div>
      <div className="parasha-week-names">
        {current.portions.map((p) => (
          <Link key={p.slug} href={`/library/parashat/${p.slug}`} className="parasha-week-name">
            <span className="parasha-he" lang="he">{p.hebrew}</span> {" "}
            <strong>{p.name}</strong> {" "}
            <small className="muted">{p.range}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
