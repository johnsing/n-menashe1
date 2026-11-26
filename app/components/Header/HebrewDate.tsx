"use client";

import { useEffect, useState } from "react";
import { HDate } from "@hebcal/core";

import { useLocale } from "@/app/components/providers/LocaleProvider";

function formatHebrewDate(now: Date, locale: "he" | "en"): string {
  const hebrewDate = new HDate(now);
  // Gematriya without nikud reads naturally in the compact header.
  return locale === "he"
    ? hebrewDate.renderGematriya(true)
    : hebrewDate.render("en");
}

export default function HebrewDate() {
  const { locale } = useLocale();
  // The server does not know the visitor's timezone, so rendering a date
  // during SSR would either be wrong or cause a hydration mismatch. Start
  // empty, then compute the date in the browser.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let midnightTimer: number | undefined;

    const refresh = () => {
      const current = new Date();
      setNow(current);

      // Re-check just after local midnight. Recomputing the delay on every
      // pass also keeps the timer correct across daylight-saving changes,
      // and the visibility listener catches tabs that were suspended.
      if (midnightTimer !== undefined) window.clearTimeout(midnightTimer);
      const nextMidnight = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + 1,
        0,
        0,
        1,
      );
      midnightTimer = window.setTimeout(
        refresh,
        nextMidnight.getTime() - current.getTime(),
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
    <span
      className="nav-date"
      lang={locale}
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      {now ? formatHebrewDate(now, locale) : ""}
    </span>
  );
}
