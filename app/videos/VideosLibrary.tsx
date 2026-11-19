// app/videos/VideosLibrary.tsx — interactive video library.
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  VIDEO_CATEGORIES,
  thumbnailUrl,
  validateVideoId,
  videoKey,
  videoPath,
  type Video,
  type VideoCategory,
} from "./video-data";
import { useVideoLibrary } from "./use-video-library";

const FILTER_OPTIONS: { key: VideoCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...VIDEO_CATEGORIES.map((category) => ({ key: category, label: category })),
];

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface VideosLibraryProps {
  initialVideos: Video[];
}

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
        aria-label={`Open video page for ${video.title} on YouTube`}
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

export default function VideosLibrary({
  initialVideos,
}: VideosLibraryProps) {
  const {
    videos,
    storedVideos,
    isLoading,
    loadError,
    isConfigured,
    addVideo,
    removeVideo,
  } = useVideoLibrary(initialVideos);

  const removableKeys = useMemo(
    () => new Set(storedVideos.map(videoKey)),
    [storedVideos],
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [category, setCategory] = useState<VideoCategory | "">("");
  const [activeCategory, setActiveCategory] = useState<VideoCategory | "all">(
    "all",
  );
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [removingKey, setRemovingKey] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  // Counts stay visible on the chips so an empty category is obvious.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: videos.length };
    for (const option of VIDEO_CATEGORIES) counts[option] = 0;

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

  // ── Add dialog: Escape, scroll lock, focus trap, focus restore ──
  useEffect(() => {
    if (!isAddOpen) return;

    const dialog = modalRef.current;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusTimer = window.setTimeout(() => {
      idInputRef.current?.focus();
    }, 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsAddOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;

      const restoreTarget = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (restoreTarget) {
        window.setTimeout(() => restoreTarget.focus(), 0);
      }
    };
  }, [isAddOpen]);

  function openAddDialog() {
    setVideoId("");
    setTitle("");
    setSpeaker("");
    setCategory("");
    setFormError("");
    setStatusMessage("");
    setIsAddOpen(true);
  }

  function closeAddDialog() {
    setIsAddOpen(false);
  }

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const id = videoId.trim();
    const idError = validateVideoId(id);

    if (idError) {
      setFormError(idError);
      idInputRef.current?.focus();
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setFormError("Add a title so the video is easy to find.");
      titleInputRef.current?.focus();
      return;
    }

    if (!category) {
      setFormError("Choose a category for this video.");
      categorySelectRef.current?.focus();
      return;
    }

    const video: Video = {
      id,
      title: cleanTitle.slice(0, 140),
      speaker: speaker.trim().slice(0, 80),
      category,
    };

    if (videos.some((entry) => videoKey(entry) === videoKey(video))) {
      setFormError("That video is already in the library.");
      idInputRef.current?.focus();
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const result = await addVideo(video);

      if (result === "duplicate") {
        setFormError("That video is already in the library.");
        idInputRef.current?.focus();
        return;
      }

      if (result === "unavailable") {
        setFormError(
          "Could not save to the shared library. Check your connection and try again.",
        );
        return;
      }

      setStatusMessage(`Added “${video.title}”.`);
      setVideoId("");
      setTitle("");
      setSpeaker("");
      setCategory("");
      setFormError("");
      setIsAddOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(video: Video) {
    const key = videoKey(video);
    if (removingKey === key) return;

    if (
      !window.confirm(`Remove “${video.title}” from the shared library?`)
    ) {
      return;
    }

    const index = storedVideos.findIndex((entry) => videoKey(entry) === key);
    const neighbor = storedVideos[index + 1] ?? storedVideos[index - 1] ?? null;

    setRemovingKey(key);

    try {
      if (!(await removeVideo(video))) {
        setStatusMessage(
          "Could not remove the shared video. Check your connection and try again.",
        );
        return;
      }

      setStatusMessage(`Removed “${video.title}”.`);

      // Keep keyboard focus in the grid instead of dropping it on <body>.
      window.requestAnimationFrame(() => {
        const neighborButton = neighbor
          ? removeButtonRefs.current.get(videoKey(neighbor))
          : null;
        (neighborButton ?? addButtonRef.current)?.focus();
      });
    } finally {
      setRemovingKey("");
    }
  }

  return (
    <main className="container videos-page">
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
            onClick={openAddDialog}
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
                {categoryCounts[option.key] ?? 0}
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
          {visibleVideos.map((video, index) => {
            const key = videoKey(video);

            return (
              <article key={key} className="video-tile">
                <VideoPoster
                  video={video}
                  eager={index === 0}
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
                      <span className="video-category-tag">
                        {video.category}
                      </span>
                    )}
                  </div>

                  {removableKeys.has(key) && (
                    <button
                      ref={(node) => {
                        if (node) removeButtonRefs.current.set(key, node);
                        else removeButtonRefs.current.delete(key);
                      }}
                      type="button"
                      className="video-remove"
                      onClick={() => void handleRemove(video)}
                      disabled={removingKey === key}
                      aria-busy={removingKey === key}
                      aria-label={`Remove ${video.title}`}
                      title="Remove"
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add video dialog */}
      {isAddOpen && (
        <div
          className="video-add-backdrop"
          onClick={(event) => {
            if (!isSaving && event.target === event.currentTarget) {
              closeAddDialog();
            }
          }}
        >
          <div
            ref={modalRef}
            id="video-add-dialog"
            className="video-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-add-dialog-title"
            aria-describedby="video-add-dialog-desc"
          >
            <div className="video-add-head">
              <div>
                <p className="videos-kicker">New video</p>
                <h2 id="video-add-dialog-title">Add a video</h2>
              </div>
              <button
                type="button"
                className="video-add-close"
                onClick={closeAddDialog}
                disabled={isSaving}
                aria-label="Close dialog"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <p className="video-add-desc" id="video-add-dialog-desc">
              Paste just the YouTube video ID — no full link needed. Videos you
              add are saved to the shared library.
            </p>

            <form
              className="video-add-form"
              onSubmit={handleAddSubmit}
              noValidate
            >
              <div className="video-add-field">
                <label className="video-add-label" htmlFor="video-id">
                  YouTube video ID
                  <span className="video-add-required">Required</span>
                </label>
                <input
                  ref={idInputRef}
                  id="video-id"
                  className="input video-id-input"
                  type="text"
                  placeholder="JHeBK-2JDz0"
                  value={videoId}
                  onChange={(event) => {
                    setVideoId(event.target.value);
                    if (formError) setFormError("");
                  }}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  aria-describedby="video-id-hint"
                />
                <p className="video-add-hint" id="video-id-hint">
                  Paste the 11-character ID from the video link — not the whole
                  URL.
                </p>
              </div>

              <div className="video-add-field">
                <label className="video-add-label" htmlFor="video-title">
                  Title
                  <span className="video-add-required">Required</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="video-title"
                  className="input"
                  type="text"
                  placeholder="e.g. The meaning of Sukkot"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (formError) setFormError("");
                  }}
                  maxLength={140}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="video-add-field">
                <label className="video-add-label" htmlFor="video-speaker">
                  Name
                  <span className="video-add-optional">Optional</span>
                </label>
                <input
                  id="video-speaker"
                  className="input"
                  type="text"
                  placeholder="e.g. Rabbi Jason Sobel"
                  value={speaker}
                  onChange={(event) => {
                    setSpeaker(event.target.value);
                    if (formError) setFormError("");
                  }}
                  maxLength={80}
                  autoComplete="off"
                />
              </div>

              <div className="video-add-field">
                <label className="video-add-label" htmlFor="video-category">
                  Category
                  <span className="video-add-required">Required</span>
                </label>
                <select
                  ref={categorySelectRef}
                  id="video-category"
                  className="input select video-category-select"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as VideoCategory | "");
                    if (formError) setFormError("");
                  }}
                  required
                >
                  <option value="">Choose a category</option>
                  {VIDEO_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="video-add-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="video-add-actions">
                <button
                  type="button"
                  className="btn video-add-cancel"
                  onClick={closeAddDialog}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn video-add-submit"
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  <FiPlus aria-hidden="true" />
                  {isSaving ? "Adding…" : "Add video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
