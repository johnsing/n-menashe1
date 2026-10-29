"use client";
// app/components/audio/PlayerBar.tsx — persistent Spotify-style bottom bar.
// Sits above the tab bar; playback survives navigation because the
// HTMLAudioElement lives in the store, not in this component.
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiVolume2 } from "react-icons/fi";
import { usePlayerStore, useCurrentTrack } from "@/app/audio/player-store";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerBar() {
  const track = useCurrentTrack();
  const { isPlaying, currentTime, duration, volume } = usePlayerStore();
  const { toggle, next, prev, seek, setVolume } = usePlayerStore();

  if (!track) return null;

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
          <strong>{track.title}</strong>
          <small className="muted">{track.artist}</small>
        </span>
      </div>

      <div className="pb-controls">
        <div className="pb-buttons">
          <button onClick={prev} aria-label="Previous track">
            <FiSkipBack />
          </button>
          <button
            className="pb-play"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={next} aria-label="Next track">
            <FiSkipForward />
          </button>
        </div>
        <div className="pb-seek">
          <span className="pb-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="pb-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="pb-volume">
        <FiVolume2 aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
