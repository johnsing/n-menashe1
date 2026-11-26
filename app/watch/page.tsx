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

async function resolveVideoId(
  searchParams: WatchPageProps["searchParams"],
): Promise<string | null> {
  const { v } = await searchParams;
  const id = Array.isArray(v) ? v[0] : v;

  return id && isValidVideoId(id) ? id : null;
}

export async function generateMetadata({
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const id = await resolveVideoId(searchParams);
  if (!id) notFound();

  const video =
    findSeedVideo(id) ??
    (await fetchSharedVideo(id).catch(() => null));

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
  const id = await resolveVideoId(searchParams);
  if (!id) notFound();

  return <VideoWatch id={id} initialVideos={SEED_VIDEOS} />;
}
