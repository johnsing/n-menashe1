import HomeContent from "./components/HomeContent";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "תורה, זמנים וקהילה",
  description:
    "זמני היום, התנ״ך השלם, שיעורים וקהילה של לומדים — בית של תורה, תפילה וקהילה.",
});

export default function Home() {
  return <HomeContent />;
}
