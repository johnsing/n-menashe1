// app/videos/video-store.ts — browser-local additions to the video library.
//
// Only videos added through the "Add video" dialog are stored here; the
// curated seed list stays in code. This mirrors the Q&A page's localStorage
// approach: additions survive reloads in this browser.

import {
  SEED_VIDEOS,
  normalizeVideo,
  videoKey,
  type Video,
} from "./video-data";

const STORAGE_KEY = "n-menashe-videos-v1";
const STORAGE_CHANGE = "videos-storage-change";
const EMPTY_ADDED_VIDEOS: Video[] = [];

let cachedSnapshot: Video[] = EMPTY_ADDED_VIDEOS;
let cachedSnapshotKey = "";

function readStoredVideos(): Video[] {
  if (typeof window === "undefined") return EMPTY_ADDED_VIDEOS;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY_ADDED_VIDEOS;
  }

  if (!raw) return EMPTY_ADDED_VIDEOS;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ADDED_VIDEOS;

    const seen = new Set<string>();
    const videos: Video[] = [];

    for (const item of parsed) {
      const video = normalizeVideo(item);
      if (!video) continue;

      const key = videoKey(video);
      if (seen.has(key)) continue;
      seen.add(key);
      videos.push(video);
    }

    return videos;
  } catch {
    return EMPTY_ADDED_VIDEOS;
  }
}

// useSyncExternalStore needs a stable reference between reads.
export function getAddedVideosSnapshot(): Video[] {
  const videos = readStoredVideos();
  const key = JSON.stringify(videos);

  if (key !== cachedSnapshotKey) {
    cachedSnapshotKey = key;
    cachedSnapshot = videos;
  }

  return cachedSnapshot;
}

export const getServerAddedVideosSnapshot = () => EMPTY_ADDED_VIDEOS;

export function subscribeToAddedVideos(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STORAGE_CHANGE, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STORAGE_CHANGE, onStoreChange);
  };
}

function saveAddedVideos(videos: Video[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch {
    return false;
  }

  window.dispatchEvent(new Event(STORAGE_CHANGE));
  return true;
}

export type AddVideoResult = "added" | "duplicate" | "unavailable";

export function addVideo(video: Video): AddVideoResult {
  const current = getAddedVideosSnapshot();
  const key = videoKey(video);
  const alreadyExists =
    current.some((entry) => videoKey(entry) === key) ||
    SEED_VIDEOS.some((entry) => videoKey(entry) === key);

  if (alreadyExists) return "duplicate";

  const saved = saveAddedVideos([...current, video]);
  return saved ? "added" : "unavailable";
}

export function removeVideo(video: Video) {
  const key = videoKey(video);
  return saveAddedVideos(
    getAddedVideosSnapshot().filter((entry) => videoKey(entry) !== key),
  );
}
