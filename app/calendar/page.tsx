// app/calendar/page.tsx — live Zmanim Train timetable
import type { Metadata } from "next";
import ZmanimTrainApp from "@/app/components/Zmanim/ZmanimTrainApp";

export const metadata: Metadata = {
  title: "Zmanim Train",
  description:
    "Live zmanim and Shabbat times for Jerusalem, Haifa, Tiberias and more, presented as a station departure board.",
};

export default function CalendarPage() {
  return <ZmanimTrainApp />;
}
