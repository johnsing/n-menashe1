"use client";

import type { WifiStatus } from "@/app/utils/wifiStatus";

const COLORS: Record<WifiStatus, string> = {
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
};

const LABELS: Record<WifiStatus, string> = {
  green: "arriving soon",
  red: "departed",
  yellow: "scheduled",
};

interface AnimatedWifiProps {
  status: WifiStatus;
  size?: number;
}

export default function AnimatedWifi({
  status,
  size = 26,
}: AnimatedWifiProps) {
  return (
    <div
      style={{ width: size, height: size, display: "inline-block" }}
      role="img"
      aria-label={LABELS[status]}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS[status]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full transition-colors duration-300 animate-pulse"
      >
        <circle cx="12" cy="18" r="1" fill={COLORS[status]} stroke="none" />
        <path d="M8.5 14.5a5 5 0 0 1 7 0" />
        <path d="M5.5 11.5a9 9 0 0 1 13 0" />
        <path d="M2.5 8.5a13 13 0 0 1 19 0" />
      </svg>
    </div>
  );
}
