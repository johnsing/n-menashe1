"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import AddVideoDialog from "./AddVideoDialog";
import {
  VIDEO_CATEGORIES,
  thumbnailUrl,
  videoPath,
  type Video,
  type VideoCategory,
} from "./video-data";
import { useVideoLibrary } from "./use-video-library";

const FILTER_OPTIONS: { key: VideoCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...VIDEO_CATEGORIES.map((category) => ({ key: category, label: category })),
];

function VideoPoster({
  video,
  eager = false,
  sizes,
}: {
  video: Video;
  eager?: boolean;
  sizes: string;
}) {
  return (
    <div className="video-frame video-poster">
      <Link
        className="video-poster-link"
        href={videoPath(video)}
        aria-label={`Watch ${video.title}`}
      >
        <Image
          className="video-poster-img"
          src={thumbnailUrl(video)}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
        />
        <span className="video-poster-provider" aria-hidden="true">
          YouTube
        </span>
      </Link>
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  eager: boolean;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: (video: Video) => void;
  registerRemoveButton: (
    id: string,
    button: HTMLButtonElement | null,
  ) => void;
}

function VideoCard({
  video,
  eager,
  canRemove,
  isRemoving,
  onRemove,
  registerRemoveButton,
}: VideoCardProps) {
  return (
    <article className="video-tile">
      <VideoPoster
        video={video}
        eager={eager}
        sizes="(max-width: 560px) 100vw, (max-width: 820px) 50vw, (max-width: 1100px) 33vw, 25vw"
      />

      <div className="video-tile-body">
        <div className="video-tile-copy">
          <Link className="video-tile-link" href={videoPath(video)}>
            <h2>{video.title}</h2>
          </Link>
          {video.speaker && (
            <p className="video-speaker">{video.speaker}</p>
          )}
          {video.category && (
            <span className="video-category-tag">{video.category}</span>
          )}
        </div>

        {canRemove && (
          <button
            ref={(button) => registerRemoveButton(video.id, button)}
            type="button"
            className="video-remove"
            onClick={() => onRemove(video)}
            disabled={isRemoving}
            aria-busy={isRemoving}
            aria-label={`Remove ${video.title}`}
            title="Remove"
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

export default function VideosLibrary({
  initialVideos,
}: {
  initialVideos: Video[];
}) {
  const {
    videos,
    storedVideos,
    isLoading,
    loadError,
    isConfigured,
    addVideo,
    removeVideo,
  } = useVideoLibrary(initialVideos);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    VideoCategory | "all"
  >("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [removingId, setRemovingId] = useState("");

  const addButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  const removableIds = useMemo(
    () => new Set(storedVideos.map((video) => video.id)),
    [storedVideos],
  );

  const categoryCounts = useMemo(() => {
    const counts = {
      all: videos.length,
    } as Record<VideoCategory | "all", number>;

    for (const category of VIDEO_CATEGORIES) counts[category] = 0;
    for (const video of videos) {
      if (video.category) counts[video.category] += 1;
    }

    return counts;
  }, [videos]);

  const visibleVideos = useMemo(
    () =>
      activeCategory === "all"
        ? videos
        : videos.filter((video) => video.category === activeCategory),
    [activeCategory, videos],
  );

  function registerRemoveButton(
    id: string,
    button: HTMLButtonElement | null,
  ) {
    if (button) removeButtonRefs.current.set(id, button);
    else removeButtonRefs.current.delete(id);
  }

  async function handleRemove(video: Video) {
    if (removingId === video.id) return;

    if (
      !window.confirm(`Remove “${video.title}” from the shared library?`)
    ) {
      return;
    }

    const index = storedVideos.findIndex((entry) => entry.id === video.id);
    const neighbor = storedVideos[index + 1] ?? storedVideos[index - 1] ?? null;

    setRemovingId(video.id);
    const removed = await removeVideo(video);
    setRemovingId("");

    if (!removed) {
      setStatusMessage(
        "Could not remove the shared video. Check your connection and try again.",
      );
      return;
    }

    setStatusMessage(`Removed “${video.title}”.`);

    window.requestAnimationFrame(() => {
      const neighborButton = neighbor
        ? removeButtonRefs.current.get(neighbor.id)
        : null;
      (neighborButton ?? addButtonRef.current)?.focus();
    });
  }

  return (
    <div className="container videos-page" lang="en" dir="ltr">
      <header className="videos-hero">
        <div className="videos-hero-copy">
          <p className="videos-kicker">Video library</p>
          <h1>Videos</h1>
          <p className="videos-sub">
            Torah &amp; holiday teachings — browse the lessons and open one to
            watch it in the full player.
          </p>
        </div>

        <div className="videos-hero-actions">
          <button
            ref={addButtonRef}
            type="button"
            className="videos-add-btn"
            onClick={() => setIsAddOpen(true)}
            disabled={!isConfigured}
            title={
              isConfigured
                ? undefined
                : "Add your Supabase URL and anon key to enable adding videos"
            }
            aria-haspopup="dialog"
            aria-controls="video-add-dialog"
          >
            <FiPlus aria-hidden="true" />
            Add video
          </button>
        </div>
      </header>

      <p className="video-sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      {loadError && (
        <p className="video-add-error videos-load-error" role="alert">
          {loadError}
        </p>
      )}

      {videos.length > 0 && (
        <div
          className="video-filters"
          role="group"
          aria-label="Filter videos by category"
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="video-filter"
              aria-pressed={activeCategory === option.key}
              onClick={() => setActiveCategory(option.key)}
            >
              {option.label}
              <span className="video-filter-count">
                {categoryCounts[option.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {isLoading && videos.length === 0 ? (
        <div className="videos-empty" role="status">
          <p className="videos-kicker">Loading videos</p>
          <p>Fetching the shared library…</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="videos-empty">
          <p className="videos-kicker">No videos yet</p>
          <p>
            {isConfigured
              ? "Add a YouTube video to start the library."
              : "Finish the Supabase setup to start the library."}
          </p>
        </div>
      ) : visibleVideos.length === 0 ? (
        <div className="videos-empty">
          <p className="videos-kicker">Nothing in {activeCategory}</p>
          <p>No videos have this category yet.</p>
          <button
            type="button"
            className="video-filter-reset"
            onClick={() => setActiveCategory("all")}
          >
            Show all videos
          </button>
        </div>
      ) : (
        <div className="videos-grid">
          {visibleVideos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              eager={index === 0}
              canRemove={removableIds.has(video.id)}
              isRemoving={removingId === video.id}
              onRemove={handleRemove}
              registerRemoveButton={registerRemoveButton}
            />
          ))}
        </div>
      )}

      {isAddOpen && (
        <AddVideoDialog
          onClose={() => setIsAddOpen(false)}
          onAdd={addVideo}
          onAdded={(title) => setStatusMessage(`Added “${title}”.`)}
        />
      )}
    </div>
  );
}
