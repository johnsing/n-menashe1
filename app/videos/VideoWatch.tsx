// app/videos/VideoWatch.tsx — full-page player for one video.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiExternalLink,
} from "react-icons/fi";

import {
  IFRAME_ALLOW,
  PROVIDER_LABEL,
  embedUrl,
  videoKey,
  videoPath,
  watchUrl,
  type Video,
  type VideoProvider,
} from "./video-data";
import { useVideoLibrary } from "./use-video-library";

interface VideoWatchProps {
  id: string;
  initialVideos: Video[];
  provider: VideoProvider;
}

export default function VideoWatch({
  id,
  initialVideos,
  provider,
}: VideoWatchProps) {
  const { videos } = useVideoLibrary(initialVideos);
  const targetKey = videoKey({ provider, id });

  // A valid ID can always play, even when its title was saved in another
  // browser. The generic fallback upgrades as soon as local data is available.
  const video: Video =
    videos.find((entry) => videoKey(entry) === targetKey) ?? {
      id,
      provider,
      title: "",
      speaker: "",
    };

  const moreVideos = videos
    .filter((entry) => videoKey(entry) !== targetKey)
    .slice(0, 4);

  const title = video.title || `${PROVIDER_LABEL[provider]} video`;

  // The browser-local title arrives after hydration; keep the tab label in
  // sync with what the page is showing. Curated seed pages already match.
  useEffect(() => {
    if (!video.title) return;

    const nextTitle = `${video.title} | N-MENASHE`;
    const syncTitle = () => {
      if (document.title !== nextTitle) document.title = nextTitle;
    };

    syncTitle();
    const observer = new MutationObserver(syncTitle);
    observer.observe(document.head, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [video.title]);

  return (
    <main className="container videos-page video-watch-page">
      <nav className="video-watch-nav" aria-label="Breadcrumb">
        <Link href="/videos" className="video-watch-back">
          <FiArrowLeft aria-hidden="true" />
          All videos
        </Link>
      </nav>

      <article className="video-watch-card" aria-labelledby="video-watch-title">
        <div className="video-watch-media">
          <div className="video-frame video-watch-frame">
            <iframe
              key={targetKey}
              className="video-embed"
              src={embedUrl(video)}
              title={video.title || `${PROVIDER_LABEL[provider]} video ${id}`}
              loading="eager"
              allow={IFRAME_ALLOW}
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="video-watch-body">
          <p className="videos-kicker">
            Now playing
            <span className="video-watch-kicker-sep" aria-hidden="true">
              ·
            </span>
            {PROVIDER_LABEL[provider]}
          </p>

          <h1 className="video-watch-title" id="video-watch-title">
            {title}
          </h1>

          {video.speaker && (
            <p className="video-speaker video-watch-speaker">
              {video.speaker}
            </p>
          )}

          <div className="video-watch-actions">
            <a
              className="video-watch-link video-watch-primary"
              href={watchUrl(video)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch on ${PROVIDER_LABEL[provider]}: ${title}`}
            >
              Watch on {PROVIDER_LABEL[provider]}
              <FiExternalLink aria-hidden="true" />
            </a>

            <Link className="video-watch-link" href="/videos">
              <FiArrowLeft aria-hidden="true" />
              Back to all videos
            </Link>
          </div>

          <p className="video-watch-id">
            <span>{PROVIDER_LABEL[provider]} ID</span>
            <code>{id}</code>
          </p>

          <p className="video-watch-note">
            Playback is embedded from {PROVIDER_LABEL[provider]}. If the player
            does not load, use the watch link above to open it in a new tab.
            {provider === "anonmp4" &&
              " AnonMP4 players are single-use; if this one has expired, the watch link opens a fresh player."}
            {!video.title &&
              " The saved title for this video is not available in this browser, but the player still works by ID."}
          </p>
        </div>
      </article>

      {moreVideos.length > 0 && (
        <section
          className="video-watch-more"
          aria-labelledby="video-watch-more-title"
        >
          <div className="videos-section-head">
            <h2 id="video-watch-more-title">More teachings</h2>
            <span className="videos-section-count">
              {moreVideos.length}{" "}
              {moreVideos.length === 1 ? "video" : "videos"}
            </span>
          </div>

          <div className="video-more-grid">
            {moreVideos.map((entry) => (
              <Link
                key={videoKey(entry)}
                className="video-more-card"
                href={videoPath(entry)}
              >
                <span className="video-more-provider">
                  {PROVIDER_LABEL[entry.provider]}
                </span>
                <span className="video-more-title">{entry.title}</span>
                {entry.speaker && (
                  <span className="video-more-speaker">{entry.speaker}</span>
                )}
                <span className="video-more-open">
                  Open video
                  <FiArrowRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
