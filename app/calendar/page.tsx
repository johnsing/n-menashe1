// app/calendar/page.tsx — Zmanim Train timetable
import type { Metadata } from "next";
import ZmanimTrainApp from "@/app/components/Zmanim/ZmanimTrainApp";
import "@/app/zmanim-board.css";

export const metadata: Metadata = {
  title: "Zmanim Train",
  description: "Today's prayer times as a live transit board.",
};

export default function CalendarPage() {
  return <ZmanimTrainApp />;
}
