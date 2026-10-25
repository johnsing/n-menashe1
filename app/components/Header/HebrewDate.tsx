// app/components/Header/HebrewDate.tsx
"use client";

import { useEffect, useState } from "react";

function toApiDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Displays today's Hebrew date, fetched as JSON from Hebcal's
 * Gregorian→Hebrew converter API (the same domain the app already
 * uses for zmanim — no document.write, no script injection).
 *
 * Response shape: { hd: 15, hm: "Cheshvan", hy: 5787 }
 */
export default function HebrewDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const url = `https://www.hebcal.com/converter?cfg=json&date=${toApiDate(new Date())}&g2h=1&strict=1`;

    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Hebcal converter failed");
        return r.json();
      })
      .then((j) => setDate(`${j.hd} ${j.hm} ${j.hy}`))
      .catch(() => {
        /* offline / error → leave the header date blank */
      });

    return () => controller.abort();
  }, []);

  return (
    <span className="nav-date" lang="he">
      {date}
    </span>
  );
}
