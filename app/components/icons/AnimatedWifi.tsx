"use client";

import type { WifiStatus } from "@/app/utils/wifiStatus";

interface AnimatedWifiProps {
  status: WifiStatus;
  size?: number;
}

export default function AnimatedWifi({
  status,
  size = 26,
}: AnimatedWifiProps) {
  // Define colors based on status
  const colorMap = {
    green: "#22c55e", // Tailwind green-500
    red: "#ef4444",   // Tailwind red-500
    yellow: "#eab308", // Tailwind yellow-500 (or orange/gray depending on your theme)
  };

  const strokeColor = colorMap[status] || "#9ca3af";

  const ariaLabel =
    status === "green"
      ? "arriving soon"
      : status === "red"
      ? "departed"
      : "scheduled";

  return (
    <div
      style={{ width: size, height: size, display: "inline-block" }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full transition-colors duration-300 animate-pulse"
      >
        {/* Dot / Base */}
        <circle cx="12" cy="18" r="1" fill={strokeColor} stroke="none" />
        
        {/* Inner Arc */}
        <path d="M8.5 14.5a5 5 0 0 1 7 0" />
        
        {/* Middle Arc */}
        <path d="M5.5 11.5a9 9 0 0 1 13 0" />
        
        {/* Outer Arc */}
        <path d="M2.5 8.5a13 13 0 0 1 19 0" />
      </svg>
    </div>
  );
}