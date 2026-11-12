// app/library/[book]/page.tsx — all chapters of one book.
// The leather cover reuses the same deterministic binding colour as the
// book's spine on the /library bookcase.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BOOKS, getBook } from "@/app/data/data";
import { bookPalette, SECTION_HEBREW } from "@/app/lib/bookDesign";

// All 39 book pages are generated at build time.
export function generateStaticParams() {
  return BOOKS.map((b) => ({ book: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string }>;
}): Promise<Metadata> {
  const { book: slug } = await params;
  const book = getBook(slug);
  if (!book) return { title: "Library" };

  return {
    title: book.name,
    description: `${book.name} — ${book.chapters} chapters. Read the Hebrew text chapter by chapter.`,
  };
}

interface CoverVars extends CSSProperties {
  "--cover-bg": string;
  "--cover-fg": string;
  "--cover-accent": string;
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book: slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const palette = bookPalette(book.slug);
  const coverVars: CoverVars = {
    "--cover-bg": palette.bg,
    "--cover-fg": palette.fg,
    "--cover-accent": palette.accent,
  };

  const position = BOOKS.findIndex((b) => b.slug === book.slug);
  const previous = position > 0 ? BOOKS[position - 1] : null;
  const next =
    position >= 0 && position < BOOKS.length - 1 ? BOOKS[position + 1] : null;

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const chapterWord = book.chapters === 1 ? "chapter" : "chapters";

  return (
    <main className="container book-page">
      <nav className="book-breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="book-breadcrumb-current" aria-current="page">
          {book.name}
        </span>
      </nav>

      <section className="book-hero" style={coverVars} aria-labelledby="book-title">
        <div className="book-cover" aria-hidden="true">
          <div className="book-cover-frame">
            <span className="book-cover-section" lang="he">
              {SECTION_HEBREW[book.section]}
            </span>
            <span className="book-cover-title">{book.name}</span>
            <span className="book-cover-ornament">✦</span>
            <span className="book-cover-meta">
              {book.chapters} {chapterWord}
            </span>
          </div>
        </div>

        <div className="book-info">
          <p className="book-kicker">{book.section}</p>
          <h1 id="book-title" className="book-title">
            {book.name}
          </h1>
          <p className="book-blurb">
            The book of {book.name}, {book.chapters} {chapterWord} — read the
            Hebrew text chapter by chapter.
          </p>

          <div className="book-actions">
            <Link href={`/library/${book.slug}/1`} className="book-cta">
              Start reading <span aria-hidden="true">→</span>
            </Link>
            <a
              className="book-secondary"
              href={`https://www.sefaria.org/${book.sefaria.replace(/ /g, "_")}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on Sefaria <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="book-note">Text provided by Sefaria · Hebrew</p>
        </div>
      </section>

      <section className="book-toc" aria-labelledby="chapters-title">
        <header className="book-toc-head">
          <h2 id="chapters-title">Chapters</h2>
          <span className="book-toc-count">
            {book.chapters} {chapterWord}
          </span>
        </header>

        <ol className="chapter-grid">
          {chapters.map((n) => (
            <li key={n}>
              <Link
                href={`/library/${book.slug}/${n}`}
                className="chapter-link"
              >
                <span className="chapter-label">Chapter</span>{" "}
                <span className="chapter-num">{n}</span>
                <span className="chapter-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <nav className="book-pager" aria-label="Browse books">
        {previous ? (
          <Link
            href={`/library/${previous.slug}`}
            className="book-pager-link book-pager-prev"
          >
            <span className="book-pager-dir" aria-hidden="true">
              ←
            </span>
            <span className="book-pager-text">
              <small>Previous book</small>
              <strong>{previous.name}</strong>
            </span>
          </Link>
        ) : (
          <span className="book-pager-empty" aria-hidden="true" />
        )}

        {next ? (
          <Link
            href={`/library/${next.slug}`}
            className="book-pager-link book-pager-next"
          >
            <span className="book-pager-text">
              <small>Next book</small>
              <strong>{next.name}</strong>
            </span>
            <span className="book-pager-dir" aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <span className="book-pager-empty" aria-hidden="true" />
        )}
      </nav>
    </main>
  );
}
