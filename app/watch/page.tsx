// app/watch/page.tsx — one shareable player page.
//
// The canonical URL is `/watch?v=<id>`. Videos stored only in the browser
// still play by ID; the client component upgrades the title when it finds the
// video in localStorage.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VideoWatch from "@/app/videos/VideoWatch";
import {
  SEED_VIDEOS,
  findSeedVideo,
  isValidVideoId,
  videoPath,
} from "@/app/videos/video-data";

interface WatchPageProps {
  searchParams: Promise<{
    v?: string | string[];
  }>;
}

interface WatchTarget {
  id: string;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function resolveWatchTarget(
  searchParams: WatchPageProps["searchParams"],
): Promise<WatchTarget | null> {
  const params = await searchParams;
  const id = firstValue(params.v);

  if (!id || !isValidVideoId(id)) {
    return null;
  }

  return { id };
}

export async function generateMetadata({
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const target = await resolveWatchTarget(searchParams);

  // Keep metadata in agreement with the page. The real 404 status is set by
  // proxy.ts before rendering, because reading searchParams makes this route
  // stream and a mid-stream notFound() can only return 200.
  if (!target) {
    notFound();
  }

  const seed = findSeedVideo(target.id);

  if (!seed) {
    return {
      title: "Watch video",
      description: "Watch this YouTube video on N-MENASHE.",
      robots: { follow: true, index: false },
    };
  }

  return {
    title: seed.title,
    description: `${seed.title}${
      seed.speaker ? ` — ${seed.speaker}` : ""
    }. Watch this YouTube teaching on N-MENASHE.`,
    alternates: { canonical: videoPath(seed) },
  };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const target = await resolveWatchTarget(searchParams);

  if (!target) {
    notFound();
  }

  return <VideoWatch id={target.id} initialVideos={SEED_VIDEOS} />;
}
