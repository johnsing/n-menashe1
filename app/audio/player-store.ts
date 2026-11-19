// app/audio/player-store.ts — zustand store around a single HTMLAudioElement.
// The audio element is a module-level singleton: playback keeps going even
// when you navigate away from /audio, and the bar re-syncs when you return.
"use client";

import { create } from "zustand";
import type { Track } from "./tracks";

interface PlayerState {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: string | null;
  history: string[]; // track ids, most recent first

  playQueue: (tracks: Track[], startIndex: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  hydrate: () => void;
}

const VOLUME_KEY = "n-menashe-audio-volume";
const HISTORY_KEY = "n-menashe-audio-history";
const HISTORY_LIMIT = 12;

let audio: HTMLAudioElement | null = null;
let lastPositionUpdate = 0;

function readVolume(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (raw === null) return null;

    const value = Number(raw);
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;
  } catch {
    return null;
  }
}

function saveVolume(volume: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // Storage can be disabled; playback still works.
  }
}

function readHistory(): string[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return null;
  }
}

function saveHistory(history: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage can be disabled; playback still works.
  }
}

function pushHistory(history: string[], id: string): string[] {
  return [id, ...history.filter((entry) => entry !== id)].slice(
    0,
    HISTORY_LIMIT,
  );
}

// Lock-screen / headset metadata. Browsers without Media Session ignore it.
function syncMetadata(track: Track | null) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  try {
    navigator.mediaSession.metadata = track
      ? new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.category,
        })
      : null;
  } catch {
    // MediaMetadata is optional; playback continues without it.
  }
}

// Keep the lock-screen play/pause button in sync with the audio element.
function syncPlaybackState(state: MediaSessionPlaybackState) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  try {
    navigator.mediaSession.playbackState = state;
  } catch {
    // Older implementations may reject the assignment; ignore.
  }
}

function bindMediaSession(get: () => PlayerState) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  const mediaSession = navigator.mediaSession;
  const handlers: Partial<
    Record<MediaSessionAction, MediaSessionActionHandler>
  > = {
    play: () => {
      if (!get().isPlaying) get().toggle();
    },
    pause: () => {
      if (get().isPlaying) get().toggle();
    },
    previoustrack: () => get().prev(),
    nexttrack: () => get().next(),
    seekto: (details) => {
      if (typeof details.seekTime === "number") get().seek(details.seekTime);
    },
    seekbackward: (details) =>
      get().seek(get().currentTime - (details.seekOffset ?? 10)),
    seekforward: (details) =>
      get().seek(get().currentTime + (details.seekOffset ?? 10)),
  };

  for (const [action, handler] of Object.entries(handlers)) {
    try {
      mediaSession.setActionHandler(
        action as MediaSessionAction,
        handler ?? null,
      );
    } catch {
      // Some actions are unsupported in every browser; skip those.
    }
  }
}

function ensureAudio(
  set: (p: Partial<PlayerState>) => void,
  get: () => PlayerState,
) {
  if (audio || typeof window === "undefined") return;

  audio = new Audio();
  audio.preload = "metadata";

  audio.addEventListener("timeupdate", () => {
    if (!audio) return;

    const currentTime = audio.currentTime;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    set({ currentTime });

    // Position state powers the lock-screen scrubber. Update about once a
    // second instead of on every timeupdate tick.
    const now = Date.now();
    if (
      duration > 0 &&
      now - lastPositionUpdate > 900 &&
      typeof navigator !== "undefined" &&
      "mediaSession" in navigator
    ) {
      lastPositionUpdate = now;
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: audio.playbackRate,
          position: Math.min(currentTime, duration),
        });
      } catch {
        // Older implementations reject incomplete state; ignore.
      }
    }
  });

  audio.addEventListener("durationchange", () => {
    const duration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
    set({ duration });
  });

  audio.addEventListener("loadedmetadata", () => {
    const duration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
    set({ duration });
  });

  audio.addEventListener("play", () => {
    set({ isPlaying: true, error: null });
    syncPlaybackState("playing");
  });
  audio.addEventListener("playing", () => {
    set({ isPlaying: true, isBuffering: false, error: null });
    syncPlaybackState("playing");
  });
  audio.addEventListener("pause", () => {
    set({ isPlaying: false, isBuffering: false });
    syncPlaybackState("paused");
  });
  audio.addEventListener("loadstart", () => {
    set({ isBuffering: true });
    syncPlaybackState("none");
  });
  audio.addEventListener("waiting", () => set({ isBuffering: true }));
  audio.addEventListener("canplay", () => set({ isBuffering: false }));
  audio.addEventListener("error", () => {
    set({
      isPlaying: false,
      isBuffering: false,
      error: "This track could not be loaded.",
    });
    syncPlaybackState("none");
  });
  audio.addEventListener("ended", () => get().next());
  audio.addEventListener("volumechange", () => {
    if (!audio) return;
    set({ volume: audio.volume, muted: audio.muted });
    saveVolume(audio.volume);
  });

  bindMediaSession(get);
}

function loadAndPlay(
  set: (p: Partial<PlayerState>) => void,
  get: () => PlayerState,
  track: Track,
) {
  ensureAudio(set, get);
  if (!audio) return;

  if (!track.src) {
    set({
      isPlaying: false,
      isBuffering: false,
      error: "This track has no audio source yet.",
    });
    return;
  }

  if (audio.src !== track.src || get().error) {
    audio.src = track.src;
    set({ currentTime: 0, duration: 0, error: null });
  }

  audio.volume = get().volume;
  audio.muted = get().muted;
  syncMetadata(track);
  set({ isBuffering: true });

  void audio
    .play()
    .catch(() => {
      set({
        isPlaying: false,
        isBuffering: false,
        error: "Playback was blocked or failed.",
      });
      syncPlaybackState("none");
    });
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  index: 0,
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  muted: false,
  error: null,
  history: [],

  playQueue: (tracks, startIndex) => {
    const track = tracks[startIndex];
    if (!track) return;

    // Clicking the track that is already loaded toggles playback instead of
    // restarting it, while still adopting the clicked list as the queue.
    const current = get().queue[get().index];
    const isSameTrack = current?.id === track.id && Boolean(audio?.src);
    const history = pushHistory(get().history, track.id);

    set({ queue: tracks, index: startIndex, history });
    saveHistory(history);

    if (isSameTrack) {
      get().toggle();
      return;
    }

    loadAndPlay(set, get, track);
  },

  toggle: () => {
    const { queue, index, isPlaying } = get();
    if (queue.length === 0) return;
    const track = queue[index];
    if (!track?.src) {
      set({
        isPlaying: false,
        isBuffering: false,
        error: "This track has no audio source yet.",
      });
      return;
    }

    ensureAudio(set, get);
    if (isPlaying) {
      audio?.pause();
      return;
    }

    if (!audio?.src || get().error) {
      loadAndPlay(set, get, track);
      return;
    }

    set({ isBuffering: true });
    void audio
      .play()
      .catch(() => {
        set({
          isPlaying: false,
          isBuffering: false,
          error: "Playback was blocked or failed.",
        });
        syncPlaybackState("none");
      });
  },

  next: () => {
    const { queue, index } = get();
    if (queue.length === 0) return;

    const nextIndex = index + 1 < queue.length ? index + 1 : 0; // loop queue
    const track = queue[nextIndex];
    const history = pushHistory(get().history, track.id);
    set({ index: nextIndex, history });
    saveHistory(history);
    loadAndPlay(set, get, track);
  },

  prev: () => {
    const { queue, index, currentTime } = get();
    if (queue.length === 0) return;

    // Spotify behaviour: if >3s in, restart the track; otherwise go back.
    if (currentTime > 3) {
      if (audio) audio.currentTime = 0;
      set({ currentTime: 0 });
      return;
    }

    const prevIndex = index > 0 ? index - 1 : queue.length - 1;
    const track = queue[prevIndex];
    const history = pushHistory(get().history, track.id);
    set({ index: prevIndex, history });
    saveHistory(history);
    loadAndPlay(set, get, track);
  },

  seek: (seconds) => {
    if (!audio?.src || !Number.isFinite(seconds)) return;

    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const next = duration > 0 ? Math.min(Math.max(seconds, 0), duration) : Math.max(seconds, 0);

    audio.currentTime = next;
    set({ currentTime: next });
  },

  setVolume: (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    if (audio) {
      audio.volume = clamped;
      if (clamped > 0 && audio.muted) audio.muted = false;
    }
    set({ volume: clamped });
    saveVolume(clamped);
  },

  toggleMute: () => {
    if (!audio) {
      set({ muted: !get().muted });
      return;
    }

    audio.muted = !audio.muted;
    if (!audio.muted && audio.volume === 0) audio.volume = 0.5;
  },

  hydrate: () => {
    if (typeof window === "undefined") return;

    const volume = readVolume();
    const history = readHistory();

    set((state) => ({
      volume: volume ?? state.volume,
      history: history ?? state.history,
    }));

    if (audio) audio.volume = volume ?? get().volume;
  },
}));

export const useCurrentTrack = () =>
  usePlayerStore((s) => s.queue[s.index] ?? null);
