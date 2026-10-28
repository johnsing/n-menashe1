// app/page.tsx
import Link from "next/link";
import ParashaThisWeek from "./utils/ParashaThisWeek";

const sections = [
  { href: "/calendar", icon: "📅", title: "Zmanim Calendar", desc: "Prayer times & daily schedule" },
  { href: "/library", icon: "📚", title: "Library", desc: "Scriptures of the Tanakh" },
  { href: "/videos", icon: "🎬", title: "Videos", desc: "Teachings & holiday lessons" },
  { href: "/audio", icon: "🎧", title: "Audio", desc: "Shiurim, worship & podcasts" },
  { href: "/qa", icon: "💬", title: "Q&A", desc: "Ask the community" },
];

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>N-MENASHE</h1>
        <p className="muted">
          <ParashaThisWeek /> — the weekly Torah portion, in order
        </p>
      </section>

      <div className="grid">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="card">
            <span className="card-icon">{s.icon}</span>
            <div>
              <h3>{s.title}</h3>
              <small className="muted">{s.desc}</small>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
