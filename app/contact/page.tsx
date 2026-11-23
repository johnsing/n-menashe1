import ContactContent from "./ContactContent";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "צור קשר",
  description:
    "יצירת קשר עם N-MENASHE — שאלות, הצעות, תמיכה ובקשות נגישות.",
});

export default function ContactPage() {
  return <ContactContent />;
}
