// app/calendar/page.tsx — live Zmanim Train timetable
import ZmanimTrainApp from "@/app/components/Zmanim/ZmanimTrainApp";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "Zmanim Train",
  description:
    "Live zmanim and Shabbat times for Jerusalem, Haifa, Tiberias and more, presented as a station departure board.",
  locale: "en_US",
});

export default function CalendarPage() {
  return <ZmanimTrainApp />;
}
