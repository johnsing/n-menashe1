import { normalizeVideo, type Video } from "./video-data";
import { getSupabaseClient } from "./supabase";

export type AddVideoOutcome = "added" | "duplicate" | "unavailable";

function rowsToVideos(rows: unknown): Video[] {
  if (!Array.isArray(rows)) return [];

  const seen = new Set<string>();
  const videos: Video[] = [];

  for (const row of rows) {
    const video = normalizeVideo(row);
    if (!video || seen.has(video.id)) continue;

    seen.add(video.id);
    videos.push(video);
  }

  return videos;
}

export async function fetchSharedVideos(): Promise<Video[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Video storage is not configured.");

  const { data: rows, error } = await supabase
    .from("videos")
    .select("id, title, speaker, category")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return rowsToVideos(rows);
}

export async function fetchSharedVideo(id: string): Promise<Video | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from("videos")
    .select("id, title, speaker, category")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return row ? normalizeVideo(row) : null;
}

export async function addSharedVideo(video: Video): Promise<AddVideoOutcome> {
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
