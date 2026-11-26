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
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="video-frame video-watch-frame">
      {isPlaying ? (
        <iframe
          className="video-embed"
          src={`${embedUrl({ id: videoId })}?autoplay=1&rel=0&playsinline=1&enablejsapi=1`}
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
            src={thumbnailUrl({ id: videoId })}
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

  // A valid ID can play before its shared row has loaded.
  const listedVideo = videos.find((entry) => entry.id === id) ?? null;
  const moreVideos = videos.filter((entry) => entry.id !== id).slice(0, 4);
  const title = listedVideo?.title || "YouTube video";

  // Streamed metadata can overwrite the title after the shared row arrives.
  useEffect(() => {
    if (!listedVideo?.title) return;

    const nextTitle = `${listedVideo.title} | N-MENASHE`;
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
  }, [listedVideo?.title]);

  return (
    <div
      className="container videos-page video-watch-page"
      lang="en"
      dir="ltr"
    >
      <nav className="video-watch-nav" aria-label="Breadcrumb">
        <Link href="/videos" className="video-watch-back">
          <FiArrowLeft aria-hidden="true" />
          All videos
        </Link>
      </nav>

      <article className="video-watch-card" aria-labelledby="video-watch-title">
        <div className="video-watch-media">
          <VideoMedia key={id} videoId={id} title={title} />
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

          {listedVideo?.speaker && (
            <p className="video-speaker video-watch-speaker">
              {listedVideo.speaker}
            </p>
          )}

          {listedVideo?.category && (
            <span className="video-category-tag video-watch-category">
              {listedVideo.category}
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
    </div>
  );
}
