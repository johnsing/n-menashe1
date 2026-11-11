// app/page.tsx
import Link from "next/link";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiCalendar,
  FiHeadphones,
  FiMessageSquare,
  FiVideo,
} from "react-icons/fi";

const sections = [
  {
    href: "/calendar",
    Icon: FiCalendar,
    title: "Zmanim Calendar",
    desc: "Prayer times, candle lighting & havdalah.",
  },
  {
    href: "/library",
    Icon: FiBookOpen,
    title: "Library",
    desc: "The full Tanakh, verse by verse.",
  },
  {
    href: "/videos",
    Icon: FiVideo,
    title: "Videos",
    desc: "Torah and holiday teachings.",
  },
  {
    href: "/audio",
    Icon: FiHeadphones,
    title: "Audio",
    desc: "Shiurim, tefillah and music.",
  },
  {
    href: "/qa",
    Icon: FiMessageSquare,
    title: "Q&A",
    desc: "Ask, answer and learn together.",
  },
];

export default function Home() {
  return (
    <main className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-art" aria-hidden="true" />
        <div className="home-hero-inner">
          <p className="home-eyebrow">Heritage library & media</p>
          <h1 id="home-title" className="home-title">
            A house of Torah, prayer & community.
          </h1>
          <p className="home-lede">
            Zmanim, Tanakh, shiurim and a community of learners — a home for
            the sacred, every day.
          </p>
          <div className="home-cta-row">
            <Link href="/library" className="btn home-cta home-cta-primary">
              Explore the Library
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/calendar" className="btn home-cta home-cta-secondary">
              Today&apos;s Zmanim
            </Link>
          </div>
        </div>
      </section>

      <section className="home-sections" aria-labelledby="home-sections-title">
        <div className="home-sections-head">
          <h2 id="home-sections-title" className="home-sections-title">
            Explore
          </h2>
          <span className="home-sections-note">Five ways in</span>
        </div>

        <div className="home-grid">
          {sections.map(({ href, Icon, title, desc }) => (
            <Link key={href} href={href} className="home-card">
              <span className="home-card-icon" aria-hidden="true">
                <Icon />
              </span>
              <div className="home-card-body">
                <h3 className="home-card-title">{title}</h3>
                <p className="home-card-desc">{desc}</p>
              </div>
              <FiArrowUpRight className="home-card-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
