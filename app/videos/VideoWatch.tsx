// app/videos/VideoWatch.tsx — full-page player for one video.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiPlay } from "react-icons/fi";

import {
  embedUrl,
  iframeAllow,
  thumbnailUrl,
  videoPath,
  type Video,
} from "./video-data";
import { useVideoLibrary } from "./use-video-library";

interface VideoWatchProps {
  id: string;
  initialVideos: Video[];
}

function VideoMedia({
  video,
  title,
}: {
  video: Video;
  title: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="video-frame video-watch-frame">
      {isPlaying ? (
        <iframe
          className="video-embed"
          src={`${embedUrl(video)}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
          title={title}
          loading="eager"
          allow={iframeAllow()}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="video-watch-poster"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play ${title}`}
        >
          <Image
            className="video-watch-poster-img"
            src={thumbnailUrl(video)}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
          <span className="video-watch-play" aria-hidden="true">
            <FiPlay />
          </span>
        </button>
      )}
    </div>
  );
}

export default function VideoWatch({
  id,
  initialVideos,
}: VideoWatchProps) {
  const { videos } = useVideoLibrary(initialVideos);

  // A valid ID can always play, even if its title is not in the shared library.
  // The generic fallback upgrades as soon as the row loads.
  const video: Video =
    videos.find((entry) => entry.id === id) ?? {
      id,
      title: "",
      speaker: "",
      category: "",
    };

  const moreVideos = videos.filter((entry) => entry.id !== id).slice(0, 4);

  const title = video.title || "YouTube video";

  // The shared title arrives after hydration; keep the tab label in sync with
  // what the page is showing. Curated seed pages already match.
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
          <VideoMedia key={id} video={video} title={title} />
        </div>

        <div className="video-watch-body">
          <p className="videos-kicker">
            Video
            <span className="video-watch-kicker-sep" aria-hidden="true">
              ·
            </span>
            YouTube
          </p>

          <h1 className="video-watch-title" id="video-watch-title">
            {title}
          </h1>

          {video.speaker && (
            <p className="video-speaker video-watch-speaker">
              {video.speaker}
            </p>
          )}

          {video.category && (
            <span className="video-category-tag video-watch-category">
              {video.category}
            </span>
          )}
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
                key={entry.id}
                className="video-more-card"
                href={videoPath(entry)}
              >
                <span className="video-more-provider">YouTube</span>
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
