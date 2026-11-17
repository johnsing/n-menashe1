// app/videos/use-video-library.ts — merge curated seeds with the Supabase library.
//
// Both the grid and the watch page use this hook. Videos added through the UI
// are stored in Supabase only; there is no browser-local fallback.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { videoKey, type Video } from "./video-data";
import { isCloudLibraryEnabled } from "./supabase";
import {
  addSharedVideo,
  fetchSharedVideos,
  removeSharedVideo,
  type AddVideoResult,
} from "./video-store";

export type VideoLibraryStatus = "loading" | "ready" | "error";

const CONFIG_ERROR =
  "Video storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local, then restart the server.";

export function useVideoLibrary(initialVideos: Video[]) {
  // Start empty on both the server and the client so hydration matches; the
  // effect below loads the shared library.
  const [storedVideos, setStoredVideos] = useState<Video[]>([]);
  const [status, setStatus] = useState<VideoLibraryStatus>(
    isCloudLibraryEnabled ? "loading" : "error",
  );
  const [loadError, setLoadError] = useState(
    isCloudLibraryEnabled ? "" : CONFIG_ERROR,
  );

  useEffect(() => {
    if (!isCloudLibraryEnabled) return;

    let cancelled = false;

    async function load() {
      try {
        const rows = await fetchSharedVideos();
        if (cancelled) return;
        setStoredVideos(rows);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStoredVideos([]);
        setStatus("error");
        setLoadError(
          "Could not load the shared video library. Check your connection and reload the page.",
        );
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { allVideos, storedOnly } = useMemo(() => {
    // Ignore a stored copy if the same video has since been added to the
    // curated seed list in code.
    const seedKeys = new Set(initialVideos.map(videoKey));
    const storedOnlyVideos = storedVideos.filter(
      (video) => !seedKeys.has(videoKey(video)),
    );

    return {
      allVideos: [...initialVideos, ...storedOnlyVideos],
      storedOnly: storedOnlyVideos,
    };
  }, [initialVideos, storedVideos]);

  const addVideo = useCallback(
    async (video: Video): Promise<AddVideoResult> => {
      if (allVideos.some((entry) => videoKey(entry) === videoKey(video))) {
        return "duplicate";
      }

      try {
        const result = await addSharedVideo(video);
        if (result === "added") {
          setStoredVideos((current) => [
            ...current.filter(
              (entry) => videoKey(entry) !== videoKey(video),
            ),
            video,
          ]);
        }
        return result;
      } catch {
        return "unavailable";
      }
    },
    [allVideos],
  );

  const removeVideo = useCallback(async (video: Video): Promise<boolean> => {
    try {
      await removeSharedVideo(video);
      setStoredVideos((current) =>
        current.filter((entry) => videoKey(entry) !== videoKey(video)),
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    videos: allVideos,
    storedVideos: storedOnly,
    isLoading: status === "loading",
    loadError,
    isConfigured: isCloudLibraryEnabled,
    addVideo,
    removeVideo,
  };
}
