// app/videos/use-video-library.ts — merge curated seeds with this browser's videos.
"use client";

import { useMemo, useSyncExternalStore } from "react";

import { videoKey, type Video } from "./video-data";
import {
  getAddedVideosSnapshot,
  getServerAddedVideosSnapshot,
  subscribeToAddedVideos,
} from "./video-store";

export function useVideoLibrary(initialVideos: Video[]) {
  const addedVideos = useSyncExternalStore(
    subscribeToAddedVideos,
    getAddedVideosSnapshot,
    getServerAddedVideosSnapshot,
  );

  return useMemo(() => {
    // Ignore a stored copy if the same video has since been added to the
    // curated seed list in code.
    const seedKeys = new Set(initialVideos.map(videoKey));
    const localVideos = addedVideos.filter(
      (video) => !seedKeys.has(videoKey(video)),
    );

    return {
      videos: [...initialVideos, ...localVideos],
      localVideos,
    };
  }, [addedVideos, initialVideos]);
}
