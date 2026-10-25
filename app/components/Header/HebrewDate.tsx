// app/components/Header/HebrewDate.tsx
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Displays today's Hebrew date using Hebcal's official widget
 * (https://www.hebcal.com/etc/hdate-he-v2.js).
 *
 * The widget renders via document.write(), which Next.js/React can't do
 * (the document is already parsed when scripts run). So we intercept
 * document.write for the brief moment the widget executes, capture the
 * Hebrew string it produces, and render it through React instead.
 */
export default function HebrewDate() {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [date, setDate] = useState("");

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    // Save the real document.write* so we can restore them afterwards
    const originalWrite = document.write;
    const originalWriteln = document.writeln;

    // Redirect the widget's output into React state
    const capture = (html: string) => setDate(html);
    document.write = capture;
    document.writeln = capture;

    const script = document.createElement("script");
    script.src = "https://www.hebcal.com/etc/hdate-he-v2.js";
    script.crossOrigin = "anonymous";
    el.appendChild(script);

    return () => {
      // restore + cleanup if the component unmounts
      document.write = originalWrite;
      document.writeln = originalWriteln;
      script.remove();
    };
  }, []);

  return <span ref={hostRef} lang="he">{date}</span>;
}