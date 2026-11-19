"use client";
// app/components/audio/PlayerBar.tsx — persistent Spotify-style bottom bar.
// Sits above the tab bar; playback survives navigation because the
// HTMLAudioElement lives in the store, not in this component.
import { useEffect } from "react";
import {
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiVolume1,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";

import { formatTime } from "@/app/audio/format-time";
import { usePlayerStore, useCurrentTrack } from "@/app/audio/player-store";

// Only the seek row reads the clock, so timeupdate ticks do not re-render the
// rest of the bar.
function PlayerSeek() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seek = usePlayerStore((s) => s.seek);

  const max = Number.isFinite(duration) && duration > 0 ? duration : 0;

  return (
    <div className="pb-seek">
      <span className="pb-time">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={max ? Math.min(currentTime, max) : 0}
        onChange={(event) => seek(Number(event.target.value))}
        aria-label="Seek"
        aria-valuetext={
          max
            ? `${formatTime(currentTime)} of ${formatTime(max)}`
            : "Seeking unavailable"
        }
        disabled={max === 0}
      />
      <span className="pb-time">{max ? formatTime(max) : "--:--"}</span>
    </div>
  );
}

export default function PlayerBar() {
  const track = useCurrentTrack();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const error = usePlayerStore((s) => s.error);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const hydrate = usePlayerStore((s) => s.hydrate);

  // Restore saved volume/history on any page, not only /audio.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Reserve page-bottom space while the bar is mounted. A class works in
  // browsers that do not support :has().
  useEffect(() => {
    if (!track) return;

    document.body.classList.add("has-player");
    return () => document.body.classList.remove("has-player");
  }, [track]);

  if (!track) return null;

  const VolumeIcon =
    muted || volume === 0 ? FiVolumeX : volume < 0.5 ? FiVolume1 : FiVolume2;
  const playLabel = isBuffering ? "Loading" : isPlaying ? "Pause" : "Play";

  return (
    <div className="player-bar" role="region" aria-label="Audio player">
      <div className="pb-track">
        <span
          className="cover-tile"
          style={{
            background: `linear-gradient(135deg, ${track.color}, #1a1a1a)`,
          }}
          aria-hidden="true"
        >
          <FiPlay />
        </span>
        <span className="pb-meta">
          <strong title={track.title}>{track.title}</strong>
          <small className={error ? "pb-error" : "muted"}>
            {error ?? track.artist}
          </small>
        </span>
      </div>

      <div className="pb-controls">
        <div className="pb-buttons">
          <button type="button" onClick={prev} aria-label="Previous track">
            <FiSkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="pb-play"
            onClick={toggle}
            aria-label={playLabel}
            aria-busy={isBuffering}
          >
            {isBuffering ? (
              <span className="pb-spinner" aria-hidden="true" />
            ) : isPlaying ? (
              <FiPause aria-hidden="true" />
            ) : (
              <FiPlay aria-hidden="true" />
            )}
          </button>
          <button type="button" onClick={next} aria-label="Next track">
            <FiSkipForward aria-hidden="true" />
          </button>
        </div>
      </div>

      <PlayerSeek />

      <div className="pb-volume">
        <button
          type="button"
          className="pb-mute"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
        >
          <VolumeIcon aria-hidden="true" />
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          aria-label="Volume"
          aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
        />
      </div>

      <p className="audio-sr-only" role="status">
        {error ? error : `Now playing ${track.title} by ${track.artist}`}
      </p>
    </div>
  );
}
