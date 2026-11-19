"use client";
// app/audio/AudioLibrary.tsx — category sections + track rows.
import { FiMusic, FiPlay } from "react-icons/fi";

import { formatTime } from "./format-time";
import { usePlayerStore, useCurrentTrack } from "./player-store";
import { CATEGORIES, TRACKS, tracksByCategory, type Track } from "./tracks";

function Cover({ track }: { track: Track }) {
  return (
    <span
      className="cover-tile"
      style={{
        background: `linear-gradient(135deg, ${track.color}, #1a1a1a)`,
      }}
      aria-hidden="true"
    >
      <FiMusic />
    </span>
  );
}

// Only the playing row subscribes to the clock, so timeupdate ticks do not
// re-render every row in the library.
function RemainingTime() {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    return <span className="track-dur">--:--</span>;
  }

  const remaining = Math.max(duration - currentTime, 0);
  return (
    <span className="track-dur" aria-label={`${formatTime(remaining)} remaining`}>
      -{formatTime(remaining)}
    </span>
  );
}

function TrackRow({
  track,
  tracks,
  index,
}: {
  track: Track;
  tracks: Track[];
  index: number;
}) {
  const current = useCurrentTrack();
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const isCurrent = current?.id === track.id;
  const playing = isCurrent && isPlaying;

  return (
    <button
      type="button"
      className={`track-row${isCurrent ? " is-current" : ""}`}
      onClick={() => playQueue(tracks, index)}
      aria-current={isCurrent ? "true" : undefined}
      aria-label={`${playing ? "Pause" : "Play"} ${track.title} by ${track.artist}`}
    >
      <span className="track-index" aria-hidden="true">
        {isCurrent ? (
          <span className={`eq${playing ? " eq-on" : ""}`}>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            <span className="idx-num">{index + 1}</span>
            <FiPlay className="idx-play" />
          </>
        )}
      </span>

      <Cover track={track} />

      <span className="track-info">
        <strong>{track.title}</strong>
        <small className="muted">{track.artist}</small>
      </span>

      {isCurrent ? <RemainingTime /> : <span className="track-dur" />}
    </button>
  );
}

export default function AudioLibrary() {
  const history = usePlayerStore((s) => s.history);

  const recent = history
    .map((id) => TRACKS.find((t) => t.id === id))
    .filter((t): t is Track => Boolean(t))
    .slice(0, 6);

  return (
    <div className="audio-wrap">
      <main className="container">
        <header className="hero">
          <h1>Audio</h1>
          <p className="muted">Shiurim, tefillah, Tehillim &amp; chagim</p>
        </header>

        {recent.length > 0 && (
          <section className="audio-section">
            <h2 className="section-title">Recently played</h2>
            <div className="recent-grid">
              {recent.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  tracks={recent}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {CATEGORIES.map((category) => {
          const tracks = tracksByCategory(category);
          if (tracks.length === 0) return null;
          return (
            <section key={category} className="audio-section">
              <h2 className="section-title">{category}</h2>
              <div className="stack">
                {tracks.map((track, i) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    tracks={tracks}
                    index={i}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
