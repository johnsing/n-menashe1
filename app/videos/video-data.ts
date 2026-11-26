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
  category: VideoCategory | ""; // empty for legacy rows saved before categories
}

export const SEED_VIDEOS: Video[] = [];

const EMBED_BASE = "https://www.youtube-nocookie.com/embed/";
const IFRAME_ALLOW = "picture-in-picture; fullscreen";

// Firefox logs a warning for the autoplay permission and works without it.
export function iframeAllow() {
  return navigator.userAgent.includes("Firefox/")
    ? IFRAME_ALLOW
    : `autoplay; ${IFRAME_ALLOW}`;
}

export const embedUrl = (video: Pick<Video, "id">) =>
  `${EMBED_BASE}${encodeURIComponent(video.id)}`;

export const thumbnailUrl = (video: Pick<Video, "id">) =>
  `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;

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
export function normalizeVideo(row: unknown): Video | null {
  if (!row || typeof row !== "object") return null;

  const fields = row as Record<string, unknown>;

  const id = fields.id;
  if (typeof id !== "string" || !isValidVideoId(id)) return null;

  const title = typeof fields.title === "string" ? fields.title.trim() : "";
  if (!title) return null;

  const speaker =
    typeof fields.speaker === "string" ? fields.speaker.trim() : "";

  // Unknown or missing categories stay playable; they simply show no tag and
  // appear only under "All".
  const category = isVideoCategory(fields.category) ? fields.category : "";

  return {
    id,
    title: title.slice(0, 140),
    speaker: speaker.slice(0, 80),
    category,
  };
}
