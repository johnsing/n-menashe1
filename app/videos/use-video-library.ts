"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Video } from "./video-data";
import { isCloudLibraryEnabled } from "./supabase";
import {
  addSharedVideo,
  fetchSharedVideos,
  removeSharedVideo,
  type AddVideoOutcome,
} from "./video-store";

export type VideoLibraryStatus = "loading" | "ready" | "error";

const CONFIG_ERROR =
  "Video storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) to .env.local, then restart the server.";

export function useVideoLibrary(initialVideos: Video[]) {
  // Start empty so the server and first client render match.
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

    async function loadSharedVideos() {
      try {
        const sharedVideos = await fetchSharedVideos();
        if (cancelled) return;

        setStoredVideos(sharedVideos);
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

    void loadSharedVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const { allVideos, storedOnly } = useMemo(() => {
    const seedIds = new Set(initialVideos.map((video) => video.id));
    const storedOnlyVideos = storedVideos.filter(
      (video) => !seedIds.has(video.id),
    );

    return {
      allVideos: [...initialVideos, ...storedOnlyVideos],
      storedOnly: storedOnlyVideos,
    };
  }, [initialVideos, storedVideos]);

  const addVideo = useCallback(
    async (video: Video): Promise<AddVideoOutcome> => {
      if (allVideos.some((entry) => entry.id === video.id)) {
        return "duplicate";
      }

      try {
        const outcome = await addSharedVideo(video);
        if (outcome === "added") {
          setStoredVideos((current) => [
            ...current.filter((entry) => entry.id !== video.id),
            video,
          ]);
        }
        return outcome;
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
        current.filter((entry) => entry.id !== video.id),
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
