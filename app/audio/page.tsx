// app/audio/page.tsx
const tracks = [
  {
    title: "Daily Shacharit & Halacha Briefing",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "14:20",
  },
  {
    title: "Weekly Parsha Insights & Shiur",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "32:15",
  },
  {
    title: "Tehillim for Difficult Times",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "21:48",
  },
];

export default function AudioPage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Audio</h1>
        <p className="muted">Shiurim, worship &amp; podcasts</p>
      </header>

      <div className="stack">
        {tracks.map((track) => (
          <article key={track.title} className="card audio-card">
            <div className="audio-row">
              <strong>{track.title}</strong>
              <small className="muted">{track.duration}</small>
            </div>
            <audio controls src={track.src} preload="none" />
          </article>
        ))}
      </div>
    </main>
  );
}