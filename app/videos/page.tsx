// app/videos/page.tsx — Torah & holiday teachings.
//
// The page stays a static Server Component for metadata. The interactive
// library lives in VideosLibrary.tsx; videos added there are stored in
// Supabase and shared by every visitor. To make a video part of the code
// itself, add it to SEED_VIDEOS in app/videos/video-data.ts.

import type { Metadata } from "next";

import VideosLibrary from "./VideosLibrary";
import { SEED_VIDEOS } from "./video-data";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Torah and holiday teachings — watch video lessons and classes.",
};

export default function VideosPage() {
  return <VideosLibrary initialVideos={SEED_VIDEOS} />;
}
