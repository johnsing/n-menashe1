// app/watch/page.tsx — one shareable player page.
//
// The canonical URL is `/watch?v=<id>` for YouTube. AnonMP4 links add
// `&provider=anonmp4` so the player can choose the right host. Videos stored
// only in the browser still play by ID; the client component upgrades the
// title when it finds the video in localStorage.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VideoWatch from "@/app/videos/VideoWatch";
import {
  PROVIDER_LABEL,
  SEED_VIDEOS,
  findSeedVideo,
  isVideoProvider,
  isValidVideoId,
  videoPath,
  type VideoProvider,
} from "@/app/videos/video-data";

interface WatchPageProps {
  searchParams: Promise<{
    provider?: string | string[];
    v?: string | string[];
  }>;
}

interface WatchTarget {
  id: string;
  provider: VideoProvider;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function resolveWatchTarget(
  searchParams: WatchPageProps["searchParams"],
): Promise<WatchTarget | null> {
  const params = await searchParams;
  const id = firstValue(params.v);
  const provider = firstValue(params.provider) ?? "youtube";

  if (!isVideoProvider(provider) || !id || !isValidVideoId(provider, id)) {
    return null;
  }

  return { id, provider };
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

  const seed = findSeedVideo(target.provider, target.id);

  if (!seed) {
    return {
      title: "Watch video",
      description: `Watch this ${PROVIDER_LABEL[target.provider]} video on N-MENASHE.`,
      robots: { follow: true, index: false },
    };
  }

  return {
    title: seed.title,
    description: `${seed.title}${
      seed.speaker ? ` — ${seed.speaker}` : ""
    }. Watch this ${PROVIDER_LABEL[seed.provider]} teaching on N-MENASHE.`,
    alternates: { canonical: videoPath(seed) },
  };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const target = await resolveWatchTarget(searchParams);

  if (!target) {
    notFound();
  }

  return (
    <VideoWatch
      id={target.id}
      initialVideos={SEED_VIDEOS}
      provider={target.provider}
    />
  );
}
