import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "Q&A Community",
  description:
    "Ask questions, share answers, and study the sources together with the N-MENASHE community.",
  locale: "en_US",
});

export default function QaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
