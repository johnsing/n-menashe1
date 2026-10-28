"use client";
// "This week's parasha" card — computed locally with @hebcal/core
// (no network, works offline). Falls back to nothing on holidays
// when there is no regular weekly portion.
import { useState } from "react";
import Link from "next/link";
import { HDate, getSedra } from "@hebcal/core";
import { PARASHIYOT, normalizeName } from "@/app/data/parashat-data";

export default function ParashaThisWeek() {
  const [current] = useState(() => {
    const date = new HDate();
    const reading = getSedra(date.getFullYear(), false).lookup(date);
    const names = reading.chag ? [] : reading.parsha;
    if (names.length === 0) return null;

    const matches = names
      .map((n) => PARASHIYOT.find((p) => normalizeName(p.name) === normalizeName(n)))
      .filter((p): p is (typeof PARASHIYOT)[number] => Boolean(p));

    return matches.length > 0 ? matches : null;
  });

  if (!current) return null;

  const isDouble = current.length > 1;

  return (
    <section className="parasha-week card">
      <div className="parasha-week-label">
        {isDouble ? "This week's parashiyot" : "This week's parasha"}
      </div>
      <div className="parasha-week-names">
        {current.map((p) => (
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
