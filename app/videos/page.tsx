// app/videos/page.tsx
const videos = [
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
    <main className="container container-wide">
      <header className="hero">
        <h1>Videos</h1>
        <p className="muted">Torah &amp; holiday teachings</p>
      </header>

      <div className="grid grid-videos">
        {videos.map((video) => (
          <article key={video.id} className="card video-card">
            <iframe
              className="video-embed"
              src={`https://www.youtube-nocookie.com/embed/${video.id}`}
              title={video.title}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="video-info">
              <h3>{video.title}</h3>
              <small className="muted">{video.speaker}</small>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
