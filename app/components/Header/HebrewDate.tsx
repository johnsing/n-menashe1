"use client";
import { useState } from "react";
import { HDate } from "@hebcal/core";

export default function HebrewDate() {
  const [date] = useState(() => {
    const hd = new HDate();
    return `${hd.getDate()} ${hd.getMonthName()} ${hd.getFullYear()}`;
  });

  return (
    <span className="nav-date" lang="he">
      {date}
    </span>
  );
}
