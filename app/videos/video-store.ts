// app/videos/video-store.ts — Supabase persistence for the video library.
//
// Every video added through the library lives in the shared `videos` table.
// There is no browser-local fallback: the `videos` table must exist in the
// Supabase project, and both NEXT_PUBLIC_SUPABASE_* variables must be set.

import { normalizeVideo, videoKey, type Video } from "./video-data";
import { getSupabaseClient } from "./supabase";

const EMPTY_VIDEOS: Video[] = [];

export type AddVideoResult = "added" | "duplicate" | "unavailable";

function rowsToVideos(data: unknown): Video[] {
  if (!Array.isArray(data)) return EMPTY_VIDEOS;

  const seen = new Set<string>();
  const videos: Video[] = [];

  for (const item of data) {
    const video = normalizeVideo(item);
    if (!video) continue;

    const key = videoKey(video);
    if (seen.has(key)) continue;
    seen.add(key);
    videos.push(video);
  }

  return videos;
}

export async function fetchSharedVideos(): Promise<Video[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Video storage is not configured.");

  const { data, error } = await supabase
    .from("videos")
    .select("id, title, speaker, category")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return rowsToVideos(data);
}

// Used by the watch page's server metadata. A missing configuration should
// only produce a generic title, not break the page.
export async function fetchSharedVideo(id: string): Promise<Video | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("videos")
    .select("id, title, speaker, category")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeVideo(data) : null;
}

export async function addSharedVideo(video: Video): Promise<AddVideoResult> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Video storage is not configured.");

  const { error } = await supabase.from("videos").insert({
    id: video.id,
    title: video.title,
    speaker: video.speaker,
    category: video.category,
  });

  if (!error) return "added";

  // The YouTube ID is the primary key, so a duplicate returns 23505.
  if (error.code === "23505") return "duplicate";

  throw new Error(error.message);
}

export async function removeSharedVideo(video: Video): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Video storage is not configured.");

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", video.id);

  if (error) throw new Error(error.message);
}
