"use client";
// Animated WiFi-style status icon, pure CSS (see .zw-* in zmanim-board.css).
import type { WifiStatus } from "@/app/utils/wifiStatus";

export default function AnimatedWifi({
  status,
  size = 26,
}: {
  status: WifiStatus;
  size?: number;
}) {
  return (
    <span
      className={`zw zw-${status}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={status === "green" ? "arriving soon" : status === "red" ? "departed" : "scheduled"}
    >
      <span className="zw-dot" />
      <span className="zw-a1" />
      <span className="zw-a2" />
      <span className="zw-a3" />
    </span>
  );
}
