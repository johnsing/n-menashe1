"use client";
// One row per zman (or Shabbat event): name, Hebrew, time,
// countdown pill, and animated status icon.
import AnimatedWifi from "@/app/components/icons/AnimatedWifi";
import { formatCountdown, getWifiStatus } from "@/app/utils/wifiStatus";
import type { Station } from "@/app/lib/zmanim";

export default function TimelineStation({
  stations,
  now,
  nextId,
  timeZone,
}: {
  stations: Station[];
  now: Date;
  nextId?: string;
  timeZone: string;
}) {
  const sorted = [...stations].sort(
    (a, b) => a.time.getTime() - b.time.getTime(),
  );

  return (
    <ol className="zt-board">
      {sorted.map((station) => {
        const status = getWifiStatus(station.time, now);
        const isNext = station.id === nextId;
        const isShabbat =
          station.kind === "candles" || station.kind === "havdalah";
        const timeStr = station.time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        });

        const IconComponent = station.icon;

        return (
          <li
            key={station.id}
            className={`zt-row st-${status}${isNext ? " is-next" : ""}${
              isShabbat ? " zt-shabbat" : ""
            }`}
          >
            <span className="zt-row-rail" aria-hidden="true">
              {IconComponent ? (
                <IconComponent size={18} />
              ) : (
                <span className="zt-row-dot" />
              )}
            </span>

            <div className="zt-row-body">
              <div className="zt-row-title">
                <span className="zt-row-name">{station.name}</span>
                {station.hebrew && (
                  <span className="zt-row-he" lang="he" dir="rtl">
                    {station.hebrew}
                  </span>
                )}
              </div>

              {(isShabbat || isNext) && (
                <div className="zt-row-badges">
                  {isShabbat && (
                    <span className="zt-shabbat-flag">Shabbat</span>
                  )}
                  {isNext && <span className="zt-badge">Next</span>}
                </div>
              )}
            </div>

            <div className="zt-row-side">
              <time
                className="zt-time"
                dateTime={station.time.toISOString()}
              >
                {timeStr}
              </time>
              <div className="zt-row-status">
                <span className={`zt-pill st-${status}`}>
                  {formatCountdown(station.time, now)}
                </span>
                <span className="zt-row-status-icon" aria-hidden="true">
                  <AnimatedWifi status={status} size={16} />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
