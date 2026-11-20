"use client";
import { useEffect, useState } from "react";
import { HDate } from "@hebcal/core";

function formatHebrewDate(now: Date): string {
  const hd = new HDate(now);
  return `${hd.getDate()} ${hd.getMonthName()} ${hd.getFullYear()}`;
}

export default function HebrewDate() {
  // The server does not know the visitor's timezone, so rendering a date
  // during SSR would either be wrong or cause a hydration mismatch. Start
  // empty, then compute the date in the browser.
  const [date, setDate] = useState("");

  useEffect(() => {
    let midnightTimer: number | undefined;

    const refresh = () => {
      const now = new Date();
      setDate(formatHebrewDate(now));

      // Re-check just after local midnight. Recomputing the delay on every
      // pass also keeps the timer correct across daylight-saving changes,
      // and the visibility listener catches tabs that were suspended.
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer);
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1,
      );
      midnightTimer = window.setTimeout(
        refresh,
        nextMidnight.getTime() - now.getTime(),
      );
    };

    refresh();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <span className="nav-date" lang="he">
      {date}
    </span>
  );
}
