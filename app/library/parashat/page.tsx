import Link from "next/link";
import type { CSSProperties } from "react";
import {
  CHUMASH_BOOKS,
  CHUMASH_HEBREW,
  CHUMASH_LABELS,
  PARASHIYOT,
} from "@/app/data/parashat-data";
import { bookPalette, type SpinePalette } from "@/app/lib/bookDesign";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "Parashat HaShavua",
  description:
    "The 54 weekly Torah portions, from Bereshit to Vezot Haberakhah, grouped by the five books of the Torah.",
  locale: "en_US",
});

interface ParashaVars extends CSSProperties {
  "--parashat-bg": string;
  "--parashat-fg": string;
  "--parashat-accent": string;
}

function parashaVars(palette: SpinePalette): ParashaVars {
  return {
    "--parashat-bg": palette.bg,
    "--parashat-fg": palette.fg,
    "--parashat-accent": palette.accent,
  };
}

export default function ParashatIndexPage() {
  const total = PARASHIYOT.length;

  const groups = CHUMASH_BOOKS.map((book) => {
    const portions = PARASHIYOT.filter((portion) => portion.book === book);
    const firstNumber =
      PARASHIYOT.findIndex((portion) => portion.book === book) + 1;

    return {
      book,
      label: CHUMASH_LABELS[book],
      hebrew: CHUMASH_HEBREW[book],
      portions,
      firstNumber,
      palette: bookPalette(book),
    };
  });

  return (
    <div className="container parashat-page" lang="en" dir="ltr">
      <nav className="book-breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="book-breadcrumb-current" aria-current="page">
          Parashat
        </span>
      </nav>

      <header className="parashat-hero">
        <div className="parashat-hero-copy">
          <p className="parashat-kicker">
            Torah
            <span className="parashat-kicker-sep" aria-hidden="true">
              ·
            </span>
            <span lang="he">תורה</span>
          </p>

          <h1 className="parashat-title">Parashat HaShavua</h1>
          <p className="parashat-hebrew" lang="he" dir="rtl">
            פרשת השבוע
          </p>

          <p className="parashat-blurb">
            From Bereshit to Vezot Haberakhah — the fifty-four weekly portions
            of the Torah, gathered in the order they are read through the year.
          </p>

          <p className="parashat-meta">
            <span>{total} portions</span>
            <span aria-hidden="true">·</span>
            <span>5 books</span>
            <span aria-hidden="true">·</span>
            <span>Annual cycle</span>
          </p>
        </div>
      </header>

      <nav className="parashat-jump" aria-label="Jump to a book">
        {groups.map((group) => (
          <a
            key={group.book}
            href={`#parashat-${group.book}`}
            className="parashat-jump-link"
            style={parashaVars(group.palette)}
          >
            <span className="parashat-jump-top">
              <span className="parashat-jump-dot" aria-hidden="true" />
              <span className="parashat-jump-name">{group.label}</span>
            </span>
            <span className="parashat-jump-sub">
              <span className="parashat-jump-he" lang="he">
                {group.hebrew}
              </span>
              <span className="parashat-jump-count">
                {group.portions.length}
                <span className="parashat-visually-hidden"> portions</span>
              </span>
            </span>
          </a>
        ))}
      </nav>

      <section className="parashat-index" aria-labelledby="parashat-index-title">
        <header className="parashat-index-head">
          <div>
            <h2 id="parashat-index-title" className="parashat-index-title">
              The Portions
            </h2>
            <p className="parashat-index-sub">
              In the order of the annual reading cycle
            </p>
          </div>
          <div className="parashat-index-count" aria-hidden="true">
            <strong>{total}</strong>
            <span>portions</span>
          </div>
        </header>

        {groups.map((group) => (
          <section
            key={group.book}
            id={`parashat-${group.book}`}
            className="parashat-book"
            style={parashaVars(group.palette)}
            aria-labelledby={`parashat-${group.book}-title`}
          >
            <header className="parashat-book-head">
              <span className="parashat-book-chip" aria-hidden="true" lang="he">
                {group.hebrew}
              </span>
              <div className="parashat-book-heading">
                <h3 id={`parashat-${group.book}-title`}>{group.label}</h3>
                <p>
                  {group.portions.length}{" "}
                  {group.portions.length === 1 ? "portion" : "portions"}
                </p>
              </div>
              <span className="parashat-book-rule" aria-hidden="true" />
            </header>

            <ol className="parashat-list">
              {group.portions.map((portion, index) => (
                <li key={portion.slug}>
                  <Link
                    href={`/library/parashat/${portion.slug}`}
                    className="parashat-portion"
                  >
                    <span className="parashat-portion-num" aria-hidden="true">
                      {group.firstNumber + index}
                    </span>
                    <span className="parashat-portion-body">
                      <span className="parashat-portion-title">
                        <span className="parashat-portion-name">
                          {portion.name}
                        </span>
                        <span
                          className="parashat-portion-he"
                          lang="he"
                          dir="rtl"
                        >
                          {portion.hebrew}
                        </span>
                      </span>
                      <span className="parashat-portion-range">
                        {portion.range}
                      </span>
                    </span>
                    <span className="parashat-portion-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </section>

      <footer className="parashat-foot">
        <Link href="/library" className="parashat-back">
          <span aria-hidden="true">←</span> Back to the Library
        </Link>
        <p className="parashat-note">
          Hebrew text from Sefaria · Read by portion
        </p>
      </footer>
    </div>
  );
}
