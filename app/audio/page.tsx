// app/audio/page.tsx
import type { Metadata } from "next";
import AudioLibrary from "./AudioLibrary";
import "./player.css";

export const metadata: Metadata = {
  title: "Audio",
  description: "Shiurim, tefillah, Tehillim & chagim — streaming audio.",
};

export default function AudioPage() {
  return <AudioLibrary />;
}
