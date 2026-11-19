// app/videos/video-data.ts — shared video types, seed library, and helpers.
//
// Videos are referenced by YouTube ID only: the 11-character ID from the
// watch URL, e.g. https://www.youtube.com/watch?v=<id>.

// Fixed groups for the library. The exact labels are stored in Supabase, so
// changing them here also requires updating the existing rows.
export const VIDEO_CATEGORIES = ["Pasal-Ho", "Numei-Ho"] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export function isVideoCategory(value: unknown): value is VideoCategory {
  return (
    typeof value === "string" &&
    (VIDEO_CATEGORIES as readonly string[]).includes(value)
  );
}

export interface Video {
  id: string;
  title: string;
  speaker: string;
  // Empty only for a legacy row saved before categories existed.
  category: VideoCategory | "";
}

export const SEED_VIDEOS: Video[] = [];

const EMBED_BASE = "https://www.youtube-nocookie.com/embed/";

// Delegate only the permissions this library uses. YouTube's stock list also
// names accelerometer, clipboard-write, encrypted-media and gyroscope; Firefox
// warns for each unsupported name. Fullscreen and picture-in-picture remain
// available.
export const IFRAME_ALLOW = "picture-in-picture; fullscreen";

// Firefox does not implement the autoplay permission and logs “Skipping
// unsupported feature name “autoplay”” for every iframe that asks for it.
// Chromium and Safari need the delegation for the poster-click autoplay to
// start with sound, so only Firefox omits it.
export function iframeAllow() {
  const isFirefox =
    typeof navigator !== "undefined" &&
    navigator.userAgent.includes("Firefox/");

  return isFirefox ? IFRAME_ALLOW : `autoplay; ${IFRAME_ALLOW}`;
}

export const embedUrl = (video: Pick<Video, "id">) =>
  `${EMBED_BASE}${encodeURIComponent(video.id)}`;

// Library cards show a still image, never an inline player.
export const thumbnailUrl = (video: Pick<Video, "id">) =>
  `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;

export const videoKey = (video: Pick<Video, "id">) => video.id;

export const videoPath = (video: Pick<Video, "id">) =>
  `/watch?v=${encodeURIComponent(video.id)}`;

export function findSeedVideo(id: string) {
  return SEED_VIDEOS.find((video) => video.id === id) ?? null;
}

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function isValidVideoId(id: string) {
  return YOUTUBE_ID_PATTERN.test(id);
}

// Returns an error message, or null when the ID is usable.
export function validateVideoId(raw: string) {
  const id = raw.trim();

  if (!id) return "Enter the video ID.";

  // IDs never contain URL punctuation. Catch full links early with a
  // clearer message than the format error below.
  if (/[:/?#&=.\s]/.test(id)) {
    return "Paste only the video ID, not the full link.";
  }

  if (!isValidVideoId(id)) {
    return "A YouTube ID is 11 letters, numbers, - or _.";
  }

  return null;
}

// Validate a row loaded from Supabase before it reaches an iframe.
export function normalizeVideo(value: unknown): Video | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  const id = record.id;
  if (typeof id !== "string" || !isValidVideoId(id)) return null;

  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) return null;

  const speaker =
    typeof record.speaker === "string" ? record.speaker.trim() : "";

  // Unknown or missing categories stay playable; they simply show no tag and
  // appear only under "All".
  const category = isVideoCategory(record.category) ? record.category : "";

  return {
    id,
    title: title.slice(0, 140),
    speaker: speaker.slice(0, 80),
    category,
  };
}
