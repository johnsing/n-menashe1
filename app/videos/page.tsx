// app/videos/page.tsx — server shell (metadata) around the client browser
import type { Metadata } from "next";
import VideosBrowser from "./VideosBrowser";
import "@/app/videos/videos.css";

export const metadata: Metadata = {
  title: "Videos",
  description: "Torah & holiday video teachings.",
};

export default function VideosPage() {
  return (
    <main className="container container-wide">
      <header className="hero">
        <h1>Videos</h1>
        <p className="muted">Torah &amp; holiday teachings</p>
      </header>

      <VideosBrowser />
    </main>
  );
}
