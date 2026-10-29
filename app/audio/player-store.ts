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
  currentTime: number;
  duration: number;
  volume: number;
  history: string[]; // track ids, most recent first

  playQueue: (tracks: Track[], startIndex: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
}

let audio: HTMLAudioElement | null = null;

function ensureAudio(
  set: (p: Partial<PlayerState>) => void,
  get: () => PlayerState,
) {
  if (audio || typeof window === "undefined") return;

  audio = new Audio();
  audio.preload = "metadata";

  audio.addEventListener("timeupdate", () =>
    set({ currentTime: audio?.currentTime ?? 0 }),
  );
  audio.addEventListener("loadedmetadata", () =>
    set({ duration: audio?.duration ?? 0 }),
  );
  audio.addEventListener("play", () => set({ isPlaying: true }));
  audio.addEventListener("pause", () => set({ isPlaying: false }));
  audio.addEventListener("ended", () => get().next());
}

function loadAndPlay(
  set: (p: Partial<PlayerState>) => void,
  get: () => PlayerState,
  src: string,
) {
  ensureAudio(set, get);
  if (!audio) return;
  if (audio.src !== src) {
    audio.src = src;
    audio.currentTime = 0;
    set({ currentTime: 0, duration: 0 });
  }
  audio.volume = get().volume;
  void audio.play().catch(() => set({ isPlaying: false }));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  index: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.9,
  history: [],

  playQueue: (tracks, startIndex) => {
    const track = tracks[startIndex];
    if (!track) return;
    set({
      queue: tracks,
      index: startIndex,
      history: [track.id, ...get().history.filter((id) => id !== track.id)].slice(0, 12),
    });
    loadAndPlay(set, get, track.src);
  },

  toggle: () => {
    const { queue, index, isPlaying } = get();
    if (queue.length === 0) return;
    ensureAudio(set, get);
    if (isPlaying) {
      audio?.pause();
    } else {
      if (!audio?.src) loadAndPlay(set, get, queue[index].src);
      else void audio.play().catch(() => set({ isPlaying: false }));
    }
  },

  next: () => {
    const { queue, index } = get();
    if (queue.length === 0) return;
    const nextIndex = index + 1 < queue.length ? index + 1 : 0; // loop queue
    const track = queue[nextIndex];
    set({
      index: nextIndex,
      history: [track.id, ...get().history.filter((id) => id !== track.id)].slice(0, 12),
    });
    loadAndPlay(set, get, track.src);
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
    set({
      index: prevIndex,
      history: [track.id, ...get().history.filter((id) => id !== track.id)].slice(0, 12),
    });
    loadAndPlay(set, get, track.src);
  },

  seek: (seconds) => {
    if (!audio) return;
    audio.currentTime = seconds;
    set({ currentTime: seconds });
  },

  setVolume: (v) => {
    const clamped = Math.min(1, Math.max(0, v));
    if (audio) audio.volume = clamped;
    set({ volume: clamped });
  },
}));

export const useCurrentTrack = () =>
  usePlayerStore((s) => s.queue[s.index] ?? null);
