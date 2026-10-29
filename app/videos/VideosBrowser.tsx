"use client";
// Videos browser: thumbnail + play overlay. The iframe only mounts
// when a thumbnail is clicked — so only ONE video can ever play at
// a time (switching cards unmounts the previous player).
import { useMemo, useState } from "react";
import Image from "next/image";
import { FiPlay } from "react-icons/fi";
import { CATEGORIES, videos, type Category, type Video } from "../data/video-data";

type Filter = Category | "All";

function VideoCard({
  video,
  isActive,
  onPlay,
}: {
  video: Video;
  isActive: boolean;
  onPlay: () => void;
}) {
  if (isActive) {
    return (
      <article className="card video-card">
        <div className="video-embed">
          <iframe
            className="video-embed"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="video-info">
          <h3>{video.title}</h3>
          <small className="muted">{video.speaker}</small>
          <span className="video-cat">{video.category}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="card video-card">
      <button
        type="button"
        className="video-thumb"
        onClick={onPlay}
        aria-label={`Play: ${video.title}`}
      >
        <Image
          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
          alt=""
          width={480}
          height={360}
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
        />
        <span className="video-play" aria-hidden="true">
          <FiPlay />
        </span>
      </button>
      <div className="video-info">
        <h3>{video.title}</h3>
        <small className="muted">{video.speaker}</small>
        <span className="video-cat">{video.category}</span>
      </div>
    </article>
  );
}

export default function VideosBrowser() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  // The only mounted player. Setting a new id unmounts the old one.
  const [activeId, setActiveId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      const matchesCategory = filter === "All" || v.category === filter;
      const matchesQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.speaker.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [filter, query]);

  return (
    <>
      <div className="videos-toolbar">
        <input
          className="input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or speaker…"
          aria-label="Search videos"
        />
      </div>

      <div className="chips" role="group" aria-label="Filter by category">
        {(["All", ...CATEGORIES] as Filter[]).map((c) => (
          <button
            key={c}
            type="button"
            className={`chip${filter === c ? " is-active" : ""}`}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="videos-count muted" aria-live="polite">
        {visible.length} {visible.length === 1 ? "video" : "videos"}
      </p>

      {visible.length === 0 ? (
        <div className="card">
          <p className="muted">
            No videos match{query ? ` “${query}”` : ""}
            {filter !== "All" ? ` in ${filter}` : ""}. Try a different search
            or category.
          </p>
        </div>
      ) : (
        <div className="grid grid-videos">
          {visible.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isActive={activeId === video.id}
              onPlay={() => setActiveId(video.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
