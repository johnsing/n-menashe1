// app/library/page.tsx — Tanakh index presented as a wooden bookcase.
// Server Component: every book is a link styled as a bound spine.
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BOOKS, SECTIONS, booksBySection, type Book } from "@/app/data/data";
import { bookPalette, spineHash } from "@/app/lib/bookDesign";

export const metadata: Metadata = {
  title: "Library",
  description: "The full Tanakh — Torah, Nevi'im and Ketuvim, book by book.",
};

const BOOKS_PER_SHELF = 7;

const SECTION_HEBREW: Record<Book["section"], string> = {
  Torah: "תורה",
  "Nevi'im": "נביאים",
  Ketuvim: "כתובים",
};

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

interface SpineVars extends CSSProperties {
  "--spine-bg": string;
  "--spine-fg": string;
  "--spine-accent": string;
  "--spine-height": string;
  "--spine-grow": number;
}

function spineVars(book: Book): SpineVars {
  const hash = spineHash(book.slug);
  const palette = bookPalette(book.slug);
  const height = 76 + (hash % 7) * 3; // 76–94% of the shelf clearance
  const grow = 0.9 + (Math.floor(hash / 7) % 7) * 0.06; // 0.90–1.26

  return {
    "--spine-bg": palette.bg,
    "--spine-fg": palette.fg,
    "--spine-accent": palette.accent,
    "--spine-height": `${height}%`,
    "--spine-grow": grow,
  };
}

export default function LibraryPage() {
  const totalChapters = BOOKS.reduce((sum, book) => sum + book.chapters, 0);

  return (
    <main className="container library-page">
      <header className="hero library-hero">
        <h1>Library</h1>
        <p className="muted">
          {BOOKS.length} books · {totalChapters} chapters — the full Tanakh,
          from Bereshit to Divrei HaYamim.
        </p>
      </header>

      <div className="bookcase">
        <div className="bookcase-crown" aria-hidden="true" />

        {SECTIONS.map((section) => {
          const books = booksBySection(section);
          const shelves = chunk(books, BOOKS_PER_SHELF);
          const headingId = `shelf-${section.toLowerCase().replace(/[^a-z]/g, "")}`;

          return (
            <section
              key={section}
              className="bookcase-bay"
              aria-labelledby={headingId}
            >
              <div className="bookcase-plaque">
                <h2 id={headingId}>{section}</h2>
                <span className="bookcase-plaque-he" lang="he">
                  {SECTION_HEBREW[section]}
                </span>
                <span className="bookcase-plaque-count">
                  {books.length} books
                </span>
              </div>

              {shelves.map((shelfBooks, shelfIndex) => (
                <div className="shelf" key={`${section}-${shelfIndex}`}>
                  <ul className="shelf-books">
                    {shelfBooks.map((book) => (
                      <li key={book.slug} style={spineVars(book)}>
                        <Link
                          href={`/library/${book.slug}`}
                          className="spine"
                          aria-label={`${book.name} — ${book.chapters} chapters`}
                          title={`${book.name} · ${book.chapters} chapters`}
                        >
                          <span className="spine-title">{book.name}</span>
                        </Link>
                      </li>
                    ))}
                    {shelfBooks.length < BOOKS_PER_SHELF && (
                      <li className="shelf-bookend" aria-hidden="true" />
                    )}
                  </ul>
                  <div className="shelf-plank" aria-hidden="true" />
                </div>
              ))}
            </section>
          );
        })}

        <div className="bookcase-base" aria-hidden="true" />
      </div>

      <Link href="/library/parashat" className="parashat-plaque">
        <span className="parashat-plaque-mark" aria-hidden="true">
          ✦
        </span>
        <span className="parashat-plaque-text">
          <strong>Parashat HaShavua</strong>
          <small>The week&rsquo;s Torah portion, read by aliyah</small>
        </span>
        <span className="parashat-plaque-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </main>
  );
}
