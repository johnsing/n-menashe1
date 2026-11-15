// app/videos/watch/[provider]/[id]/page.tsx — one shareable player page.
//
// Curated videos are pre-rendered at build time. A valid ID that only exists
// in another browser still renders and plays; the client component upgrades
// the title when it finds the video in localStorage.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VideoWatch from "@/app/videos/VideoWatch";
import {
  PROVIDER_LABEL,
  SEED_VIDEOS,
  findSeedVideo,
  isVideoProvider,
  isValidVideoId,
} from "@/app/videos/video-data";

interface VideoWatchPageProps {
  params: Promise<{ id: string; provider: string }>;
}

// Local videos are not known at build time, so allow them to render on demand.
export const dynamicParams = true;

export function generateStaticParams() {
  return SEED_VIDEOS.map((video) => ({
    id: video.id,
    provider: video.provider,
  }));
}

export async function generateMetadata({
  params,
}: VideoWatchPageProps): Promise<Metadata> {
  const { id, provider } = await params;

  if (!isVideoProvider(provider) || !isValidVideoId(provider, id)) {
    return { title: "Video not found" };
  }

  const seed = findSeedVideo(provider, id);

  if (!seed) {
    return {
      title: "Watch video",
      description: `Watch this ${PROVIDER_LABEL[provider]} video on N-MENASHE.`,
      robots: { follow: true, index: false },
    };
  }

  return {
    title: seed.title,
    description: `${seed.title}${
      seed.speaker ? ` — ${seed.speaker}` : ""
    }. Watch this ${PROVIDER_LABEL[seed.provider]} teaching on N-MENASHE.`,
  };
}

export default async function VideoWatchPage({ params }: VideoWatchPageProps) {
  const { id, provider } = await params;

  if (!isVideoProvider(provider) || !isValidVideoId(provider, id)) {
    notFound();
  }

  return (
    <VideoWatch id={id} initialVideos={SEED_VIDEOS} provider={provider} />
  );
}
