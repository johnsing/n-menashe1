"use client";
// Board header: line name, location, live clock, next-event countdown.
import { useEffect, useState } from "react";
import { formatIn } from "@/app/utils/wifiStatus";
import type { Station } from "@/app/lib/zmanim";
import { TfiLocationPin } from "react-icons/tfi";

export default function TransitHeader({
  location,
  nextStation,
}: {
  location: string;
  nextStation: Station | null;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="zt-header">
      <div className="zt-header-top">
        <div>
          <h1 className="zt-title">Zmanim Train</h1>
        </div>
        <div className="zt-clock" aria-live="off">
          {timeStr ?? "--:--"}
        </div>
      </div>

      <div className="zt-header-bottom">
        <span className="zt-loc"><TfiLocationPin /> {location}</span>
        <span className="zt-next">
          {nextStation ? (
            <>
              Next: <strong>{nextStation.name}</strong>{" "}
              {now ? formatIn(nextStation.time, now) : ""}
            </>
          ) : (
            "All of today's zmanim have passed"
          )}
        </span>
      </div>
    </header>
  );
}
