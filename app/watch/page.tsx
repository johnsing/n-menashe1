// app/watch/page.tsx — one shareable player page.
//
// The canonical URL is `/watch?v=<id>`. Shared titles come from Supabase.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import VideoWatch from "@/app/videos/VideoWatch";
import {
  SEED_VIDEOS,
  findSeedVideo,
  isValidVideoId,
  videoPath,
} from "@/app/videos/video-data";
import { fetchSharedVideo } from "@/app/videos/video-store";
import { pageMetadata } from "@/app/lib/metadata";

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

  const video =
    findSeedVideo(target.id) ??
    (await fetchSharedVideo(target.id).catch(() => null));

  if (!video) {
    return {
      ...pageMetadata({
        title: "Watch video",
        description: "Watch this YouTube video on N-MENASHE.",
        locale: "en_US",
      }),
      robots: { follow: true, index: false },
    };
  }

  return {
    ...pageMetadata({
      title: video.title,
      description: `${video.title}${
        video.speaker ? ` — ${video.speaker}` : ""
      }. Watch this YouTube teaching on N-MENASHE.`,
      locale: "en_US",
    }),
    alternates: { canonical: videoPath(video) },
  };
}

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const target = await resolveWatchTarget(searchParams);

  if (!target) {
    notFound();
  }

  return <VideoWatch id={target.id} initialVideos={SEED_VIDEOS} />;
}
