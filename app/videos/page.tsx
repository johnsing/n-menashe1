// app/videos/page.tsx — Torah & holiday teachings (YouTube embeds)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos",
  description: "Torah and holiday teachings — video lessons and classes.",
};

interface Video {
  id: string;
  title: string;
  speaker: string;
}

const videos: Video[] = [
  {
    id: "JHeBK-2JDz0",
    title: "The Jewish Holiday of Sukkot, What is It?",
    speaker: "Jewish Learning Institute",
  },
  {
    id: "wVw6_c2el2M",
    title: "Sukkot: What Does This Jewish Holiday Mean?",
    speaker: "Rabbi Jason Sobel Official",
  },
  {
    id: "RhbCrWsft0Q",
    title: "Every Jewish Holiday, Explained",
    speaker: "People Of The Book",
  },
  {
    id: "6mmZDYogjCk",
    title: "What is Purim? An introduction to the Jewish holiday",
    speaker: "BimBam",
  },
];

export default function VideosPage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Videos</h1>
        <p className="muted">Torah &amp; holiday teachings</p>
      </header>

      <div className="grid">
        {videos.map((v) => (
          <article key={v.id} className="card">
            <iframe
              className="video-embed"
              src={`https://www.youtube-nocookie.com/embed/${v.id}`}
              title={v.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <h3>{v.title}</h3>
            <small className="muted">{v.speaker}</small>
          </article>
        ))}
      </div>
    </main>
  );
}
