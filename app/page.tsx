export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>N-MENASHE</h1>
        <p className="muted">
          Heritage library &amp; media — Torah, zmanim, and community.
        </p>
      </section>

      <div className="grid">
        <a href="/calendar" className="card">
          <span className="card-icon">📅</span>
          <div>
            <h3>Zmanim Calendar</h3>
            <small className="muted">Prayer times &amp; daily schedule</small>
          </div>
        </a>

        <a href="/library" className="card">
          <span className="card-icon">📚</span>
          <div>
            <h3>Library</h3>
            <small className="muted">Scriptures of the Tanakh</small>
          </div>
        </a>

        <a href="/videos" className="card">
          <span className="card-icon">🎬</span>
          <div>
            <h3>Videos</h3>
            <small className="muted">Teachings &amp; holiday lessons</small>
          </div>
        </a>

        <a href="/audio" className="card">
          <span className="card-icon">🎧</span>
          <div>
            <h3>Audio</h3>
            <small className="muted">Shiurim, worship &amp; podcasts</small>
          </div>
        </a>

        <a href="/qa" className="card">
          <span className="card-icon">💬</span>
          <div>
            <h3>Q&amp;A</h3>
            <small className="muted">Ask the community</small>
          </div>
        </a>
      </div>
    </main>
  );
}