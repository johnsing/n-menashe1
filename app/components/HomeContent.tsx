"use client";

import Link from "next/link";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiCalendar,
  FiMail,
  FiMessageSquare,
  FiVideo,
} from "react-icons/fi";

import { useLocale } from "@/app/components/providers/LocaleProvider";
import type { MessageKey } from "@/app/lib/i18n";

const sections: {
  href: string;
  Icon: typeof FiCalendar;
  title: MessageKey;
  desc: MessageKey;
}[] = [
  {
    href: "/calendar",
    Icon: FiCalendar,
    title: "home.zmanim.title",
    desc: "home.zmanim.desc",
  },
  {
    href: "/library",
    Icon: FiBookOpen,
    title: "home.library.title",
    desc: "home.library.desc",
  },
  {
    href: "/videos",
    Icon: FiVideo,
    title: "home.videos.title",
    desc: "home.videos.desc",
  },
  {
    href: "/qa",
    Icon: FiMessageSquare,
    title: "home.qa.title",
    desc: "home.qa.desc",
  },
  {
    href: "/contact",
    Icon: FiMail,
    title: "home.contact.title",
    desc: "home.contact.desc",
  },
];

export default function HomeContent() {
  const { t } = useLocale();

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-art" aria-hidden="true" />
        <div className="home-hero-inner">
          <p className="home-eyebrow">{t("home.eyebrow")}</p>
          <h1 id="home-title" className="home-title">
            {t("home.title")}
          </h1>
          <p className="home-lede">{t("home.lede")}</p>
          <div className="home-cta-row">
            <Link
              href="/library"
              className="btn home-cta home-cta-primary"
            >
              {t("home.ctaLibrary")}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <Link
              href="/calendar"
              className="btn home-cta home-cta-secondary"
            >
              {t("home.ctaZmanim")}
            </Link>
          </div>
        </div>
      </section>

      <section
        className="home-sections"
        aria-labelledby="home-sections-title"
      >
        <div className="home-sections-head">
          <h2 id="home-sections-title" className="home-sections-title">
            {t("home.explore")}
          </h2>
          <span className="home-sections-note">{t("home.ways")}</span>
        </div>

        <div className="home-grid">
          {sections.map(({ href, Icon, title, desc }) => (
            <Link key={href} href={href} className="home-card">
              <span className="home-card-icon" aria-hidden="true">
                <Icon />
              </span>
              <div className="home-card-body">
                <h3 className="home-card-title">{t(title)}</h3>
                <p className="home-card-desc">{t(desc)}</p>
              </div>
              <FiArrowUpRight
                className="home-card-arrow"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
