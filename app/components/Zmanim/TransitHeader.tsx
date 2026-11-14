"use client";
// Board header: line name, location, live clock, next-event countdown,
// and the weekly parasha. The clock uses the selected city's timezone.
import { useEffect, useState } from "react";
import { LuBookOpen } from "react-icons/lu";
import { TfiLocationPin } from "react-icons/tfi";
import { formatIn } from "@/app/utils/wifiStatus";
import type { Station } from "@/app/lib/zmanim";

function formatClock(date: Date, timeZone: string): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

function formatDate(date: Date, timeZone: string): string {
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone,
  });
}

function zoneLabel(timeZone: string): string {
  const last = timeZone.split("/").pop() ?? timeZone;
  return last.replace(/_/g, " ");
}

export default function TransitHeader({
  location,
  nextStation,
  parasha,
  timeZone,
  loading,
  error,
}: {
  location: string;
  nextStation: Station | null;
  parasha?: string | null;
  timeZone: string;
  loading?: boolean;
  error?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Fill the clock on the next tick, then keep it ticking once a second.
    const tick = () => setNow(new Date());
    const firstTick = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(id);
    };
  }, []);

  const timeStr = now ? formatClock(now, timeZone) : null;
  const dateStr = now ? formatDate(now, timeZone) : null;
  const nextTime = nextStation
    ? formatClock(nextStation.time, timeZone)
    : null;
  const inText = now && nextStation ? formatIn(nextStation.time, now) : "";

  return (
    <header className="zt-header">
      <div className="zt-header-inner">
        <div className="zt-header-top">
          <div className="zt-brand">
            <p className="zt-kicker">
              <span className="zt-live-dot" aria-hidden="true" />
              Live timetable
            </p>
            <h1 className="zt-title">Zmanim Train</h1>
            <p className="zt-date">{dateStr ?? "Today's prayer times"}</p>
          </div>

          <div className="zt-clock" aria-live="off">
            <span className="zt-clock-time">{timeStr ?? "--:--"}</span>
            <span className="zt-clock-zone">{zoneLabel(timeZone)}</span>
          </div>
        </div>

        <div className="zt-header-meta">
          <span className="zt-loc">
            <TfiLocationPin aria-hidden="true" />
            {location}
          </span>

          <span className="zt-next">
            {loading ? (
              "Loading today's times…"
            ) : error ? (
              "Times unavailable"
            ) : nextStation ? (
              <>
                <span className="zt-next-label">Next</span>
                <strong>{nextStation.name}</strong>
                {nextTime && (
                  <time dateTime={nextStation.time.toISOString()}>
                    {nextTime}
                  </time>
                )}
                {inText && <span className="zt-next-in">{inText}</span>}
              </>
            ) : (
              "All of today's zmanim have passed"
            )}
          </span>

          {parasha && (
            <span className="zt-parasha">
              <LuBookOpen aria-hidden="true" />
              {parasha}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
