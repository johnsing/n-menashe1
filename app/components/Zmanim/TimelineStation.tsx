"use client";
// One row per zman (or shabbat event): name, Hebrew, time,
// countdown pill, animated status icon.
import AnimatedWifi from "@/app/components/icons/AnimatedWifi";
import { formatCountdown, getWifiStatus } from "@/app/utils/wifiStatus";
import type { Station } from "@/app/lib/zmanim";

export default function TimelineStation({
  stations,
  now,
  nextId,
}: {
  stations: Station[];
  now: Date;
  nextId?: string;
}) {
  const sorted = [...stations].sort(
    (a, b) => a.time.getTime() - b.time.getTime(),
  );

  return (
    <div className="zt-board">
      {sorted.map((station) => {
        const status = getWifiStatus(station.time, now);
        const isNext = station.id === nextId;
        const isShabbat = station.kind === "candles" || station.kind === "havdalah";
        const timeStr = station.time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Get the dynamic icon component assigned from zmanim.ts
        const IconComponent = station.icon;

        return (
          <div
            key={station.id}
            className={`zt-row st-${status}${isNext ? " is-next" : ""}${
              isShabbat ? " zt-shabbat" : ""
            }`}
          >
            <div className="zt-row-main">
              <div className="zt-row-name">
                {station.name}
                {station.hebrew && (
                  <span className="zt-row-he" lang="he">
                    {station.hebrew}
                  </span>
                )}
                {isShabbat && <span className="zt-shabbat-flag">Shabbat</span>}
                {isNext && <span className="zt-badge">Next</span>}
              </div>
              <div className="zt-row-meta flex items-center gap-1.5">
                {IconComponent && <IconComponent size={16} className="opacity-75" />}
                <span>{timeStr}</span>
              </div>
            </div>

            <div className="zt-row-side">
              <span className={`zt-pill st-${status}`}>
                {formatCountdown(station.time, now)}
              </span>
              <AnimatedWifi status={status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
