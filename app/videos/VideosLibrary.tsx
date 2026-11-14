// app/videos/VideosLibrary.tsx — interactive video library.
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { FiExternalLink, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import {
  ANONMP4_UPLOAD_URL,
  IFRAME_ALLOW,
  PROVIDER_HINT,
  PROVIDER_LABEL,
  PROVIDER_PLACEHOLDER,
  embedUrl,
  validateVideoId,
  videoKey,
  watchUrl,
  type Video,
  type VideoProvider,
} from "./video-data";
import {
  addVideo,
  getAddedVideosSnapshot,
  getServerAddedVideosSnapshot,
  removeVideo,
  subscribeToAddedVideos,
} from "./video-store";

const PROVIDERS: VideoProvider[] = ["youtube", "anonmp4"];

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

export default function VideosLibrary({
  initialVideos,
}: VideosLibraryProps) {
  const addedVideos = useSyncExternalStore(
    subscribeToAddedVideos,
    getAddedVideosSnapshot,
    getServerAddedVideosSnapshot,
  );

  // Ignore a stored copy if the same video has since been added to the
  // curated seed list in code.
  const localVideos = useMemo(() => {
    const seedKeys = new Set(initialVideos.map(videoKey));
    return addedVideos.filter((video) => !seedKeys.has(videoKey(video)));
  }, [addedVideos, initialVideos]);

  const videos = useMemo(
    () => [...initialVideos, ...localVideos],
    [initialVideos, localVideos],
  );

  const removableKeys = useMemo(
    () => new Set(localVideos.map(videoKey)),
    [localVideos],
  );

  const [featured, ...moreVideos] = videos;
  const videoCountLabel = `${videos.length} ${
    videos.length === 1 ? "video" : "videos"
  }`;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [provider, setProvider] = useState<VideoProvider>("youtube");
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>());

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
    setFormError("");
    setStatusMessage("");
    setIsAddOpen(true);
  }

  function closeAddDialog() {
    setIsAddOpen(false);
  }

  function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const id = videoId.trim();
    const idError = validateVideoId(provider, id);

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

    const video: Video = {
      id,
      title: cleanTitle.slice(0, 140),
      speaker: speaker.trim().slice(0, 80),
      provider,
    };

    if (videos.some((entry) => videoKey(entry) === videoKey(video))) {
      setFormError("That video is already in the library.");
      idInputRef.current?.focus();
      return;
    }

    const result = addVideo(video);

    if (result === "duplicate") {
      setFormError("That video is already in the library.");
      idInputRef.current?.focus();
      return;
    }

    if (result === "unavailable") {
      setFormError(
        "Could not save in this browser. Check that storage is enabled.",
      );
      return;
    }

    setStatusMessage(`Added “${video.title}”.`);
    setVideoId("");
    setTitle("");
    setSpeaker("");
    setFormError("");
    setIsAddOpen(false);
  }

  function handleRemove(video: Video) {
    const key = videoKey(video);
    const index = localVideos.findIndex((entry) => videoKey(entry) === key);
    const neighbor = localVideos[index + 1] ?? localVideos[index - 1] ?? null;

    if (!removeVideo(video)) {
      setStatusMessage("Could not remove the video in this browser.");
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
  }

  return (
    <main className="container videos-page">
      <header className="videos-hero">
        <div className="videos-hero-copy">
          <p className="videos-kicker">Video library</p>
          <h1>Videos</h1>
          <p className="videos-sub">
            Torah &amp; holiday teachings — watch the lessons here or open them
            in a full player.
          </p>
        </div>

        <div className="videos-hero-actions">
          <p className="videos-count" aria-label={videoCountLabel}>
            <strong>{videos.length}</strong>
            <span>{videos.length === 1 ? "Video" : "Videos"}</span>
          </p>

          <button
            ref={addButtonRef}
            type="button"
            className="videos-add-btn"
            onClick={openAddDialog}
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

      {featured && (
        <section
          className="videos-feature"
          aria-labelledby="featured-video-title"
        >
          <div className="video-frame">
            <iframe
              className="video-embed"
              src={embedUrl(featured)}
              title={featured.title}
              loading="eager"
              allow={IFRAME_ALLOW}
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="video-feature-meta">
            <div className="video-feature-copy">
              <p className="videos-kicker">Featured teaching</p>
              <h2 id="featured-video-title">{featured.title}</h2>
              {featured.speaker && (
                <p className="video-speaker">{featured.speaker}</p>
              )}
            </div>

            <a
              className="video-watch-link"
              href={watchUrl(featured)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on {PROVIDER_LABEL[featured.provider]}
              <FiExternalLink aria-hidden="true" />
            </a>
          </div>
        </section>
      )}

      {moreVideos.length > 0 && (
        <section className="videos-more" aria-labelledby="more-videos-title">
          <div className="videos-section-head">
            <h2 id="more-videos-title">More teachings</h2>
            <span className="videos-section-count">
              {moreVideos.length}{" "}
              {moreVideos.length === 1 ? "video" : "videos"}
            </span>
          </div>

          <div className="videos-grid">
            {moreVideos.map((video) => {
              const key = videoKey(video);

              return (
                <article key={key} className="video-tile">
                  <div className="video-frame">
                    <iframe
                      className="video-embed"
                      src={embedUrl(video)}
                      title={video.title}
                      loading="lazy"
                      allow={IFRAME_ALLOW}
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>

                  <div className="video-tile-body">
                    <h3>{video.title}</h3>
                    {video.speaker && (
                      <p className="video-speaker">{video.speaker}</p>
                    )}

                    <div className="video-tile-actions">
                      <a
                        className="video-watch-link"
                        href={watchUrl(video)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch on {PROVIDER_LABEL[video.provider]}
                        <FiExternalLink aria-hidden="true" />
                      </a>

                      {removableKeys.has(key) && (
                        <button
                          ref={(node) => {
                            if (node) removeButtonRefs.current.set(key, node);
                            else removeButtonRefs.current.delete(key);
                          }}
                          type="button"
                          className="video-remove"
                          onClick={() => handleRemove(video)}
                          aria-label={`Remove ${video.title}`}
                          title="Remove"
                        >
                          <FiTrash2 aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Add video dialog */}
      {isAddOpen && (
        <div
          className="video-add-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAddDialog();
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
                aria-label="Close dialog"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <p className="video-add-desc" id="video-add-dialog-desc">
              Paste just the video ID — no full link needed. Videos you add are
              saved in this browser.
            </p>

            <form
              className="video-add-form"
              onSubmit={handleAddSubmit}
              noValidate
            >
              <fieldset className="video-add-fieldset">
                <legend className="video-add-label">Source</legend>

                <div className="video-provider-toggle">
                  {PROVIDERS.map((option) => (
                    <label key={option} className="video-provider-option">
                      <input
                        type="radio"
                        name="video-provider"
                        value={option}
                        checked={provider === option}
                        onChange={() => {
                          setProvider(option);
                          setFormError("");
                        }}
                      />
                      <span>{PROVIDER_LABEL[option]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="video-add-field">
                <label className="video-add-label" htmlFor="video-id">
                  {PROVIDER_LABEL[provider]} video ID
                  <span className="video-add-required">Required</span>
                </label>
                <input
                  ref={idInputRef}
                  id="video-id"
                  className="input video-id-input"
                  type="text"
                  placeholder={PROVIDER_PLACEHOLDER[provider]}
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
                  {PROVIDER_HINT[provider]}
                  {provider === "anonmp4" && (
                    <>
                      {" "}
                      <a
                        href={ANONMP4_UPLOAD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Upload a file
                        <FiExternalLink aria-hidden="true" />
                      </a>
                    </>
                  )}
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
                  Speaker
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
                >
                  Cancel
                </button>
                <button type="submit" className="btn video-add-submit">
                  <FiPlus aria-hidden="true" />
                  Add video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
