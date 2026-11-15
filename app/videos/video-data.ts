// app/videos/video-data.ts — shared video types, seed library, and helpers.
//
// Videos are referenced by ID only:
// - YouTube: the 11-character ID from the watch URL.
// - AnonMP4: the ID from the embed link, e.g.
//   https://anonmp4.art/embed/<id> (upload at https://anonmp4.to/).
//
// Note: anonmp4.to/embed currently returns 404; anonmp4.art is the
// working player host.

export type VideoProvider = "anonmp4" | "youtube";

export interface Video {
  id: string;
  title: string;
  speaker: string;
  provider: VideoProvider;
}

export const SEED_VIDEOS: Video[] = [
  {
    id: "JHeBK-2JDz0",
    title: "The Jewish Holiday of Sukkot, What is It?",
    speaker: "Jewish Learning Institute",
    provider: "youtube",
  },
  {
    id: "wVw6_c2el2M",
    title: "Sukkot: What Does This Jewish Holiday Mean?",
    speaker: "Rabbi Jason Sobel Official",
    provider: "youtube",
  },
  {
    id: "RhbCrWsft0Q",
    title: "Every Jewish Holiday, Explained",
    speaker: "People Of The Book",
    provider: "youtube",
  },
];

export const EMBED_BASE: Record<VideoProvider, string> = {
  anonmp4: "https://anonmp4.art/embed/",
  youtube: "https://www.youtube-nocookie.com/embed/",
};

export const WATCH_BASE: Record<VideoProvider, string> = {
  anonmp4: "https://anonmp4.art/v/",
  youtube: "https://www.youtube.com/watch?v=",
};

export const PROVIDER_LABEL: Record<VideoProvider, string> = {
  anonmp4: "AnonMP4",
  youtube: "YouTube",
};

export const PROVIDER_PLACEHOLDER: Record<VideoProvider, string> = {
  anonmp4: "NLEusIzEvLs3s3B",
  youtube: "JHeBK-2JDz0",
};

export const PROVIDER_HINT: Record<VideoProvider, string> = {
  anonmp4:
    "Paste the ID from the embed link after uploading. No full link needed.",
  youtube:
    "Paste the 11-character ID from the video link — not the whole URL.",
};

export const ANONMP4_UPLOAD_URL = "https://anonmp4.to/#upload";

export const IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";

export const embedUrl = (video: Video) =>
  `${EMBED_BASE[video.provider]}${encodeURIComponent(video.id)}`;

export const watchUrl = (video: Video) =>
  `${WATCH_BASE[video.provider]}${encodeURIComponent(video.id)}`;

export const videoKey = (video: Pick<Video, "provider" | "id">) =>
  `${video.provider}:${video.id}`;

// The video ID is part of the URL, so a shared link opens the same player.
export const videoPath = (video: Pick<Video, "provider" | "id">) =>
  `/videos/watch/${video.provider}/${encodeURIComponent(video.id)}`;

export function isVideoProvider(value: string): value is VideoProvider {
  return value === "youtube" || value === "anonmp4";
}

export function findSeedVideo(provider: VideoProvider, id: string) {
  return (
    SEED_VIDEOS.find(
      (video) => video.provider === provider && video.id === id,
    ) ?? null
  );
}

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const ANONMP4_ID_PATTERN = /^[A-Za-z0-9_-]{6,32}$/;

export function isValidVideoId(provider: VideoProvider, id: string) {
  return (provider === "youtube" ? YOUTUBE_ID_PATTERN : ANONMP4_ID_PATTERN).test(
    id,
  );
}

// Returns an error message, or null when the ID is usable.
export function validateVideoId(provider: VideoProvider, raw: string) {
  const id = raw.trim();

  if (!id) return "Enter the video ID.";

  // IDs never contain URL punctuation. Catch full links early with a
  // clearer message than the format error below.
  if (/[:/?#&=.\s]/.test(id)) {
    return "Paste only the video ID, not the full link.";
  }

  if (!isValidVideoId(provider, id)) {
    return provider === "youtube"
      ? "A YouTube ID is 11 letters, numbers, - or _."
      : "An AnonMP4 ID is 6–32 letters, numbers, - or _.";
  }

  return null;
}

// Validate a value loaded from localStorage before it reaches an iframe.
export function normalizeVideo(value: unknown): Video | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const provider = record.provider;
  const id = record.id;

  if (provider !== "anonmp4" && provider !== "youtube") return null;
  if (typeof id !== "string" || !isValidVideoId(provider, id)) return null;

  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) return null;

  const speaker =
    typeof record.speaker === "string" ? record.speaker.trim() : "";

  return {
    id,
    title: title.slice(0, 140),
    speaker: speaker.slice(0, 80),
    provider,
  };
}
