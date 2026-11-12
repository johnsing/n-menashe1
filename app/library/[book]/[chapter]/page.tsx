// app/library/[book]/[chapter]/page.tsx — read one chapter, Hebrew only.
// Text comes from the free Sefaria API (no key required), cached for 24h.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getBook } from "@/app/data/data";
import { bookPalette, SECTION_HEBREW } from "@/app/lib/bookDesign";
import { sanitizeSefariaHtml } from "@/app/utils/sefaria";

export const revalidate = 86400; // ISR

interface SefariaResponse {
  ref?: string;
  he?: string[] | string[][];
  error?: string;
}

/** Normalize Sefaria's text shape (possibly nested by chapter) to flat verses. */
function toVerses(data?: string[] | string[][]): string[] {
  if (!data) return [];
  if (typeof data === "string") return [data];
  return data.flatMap((v) => (Array.isArray(v) ? v : [v]));
}

async function fetchText(ref: string) {
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
    ref,
  )}?context=0&commentary=0`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as SefariaResponse;
  if (data.error) return null;
  return { hebrew: toVerses(data.he) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}): Promise<Metadata> {
  const { book: slug, chapter } = await params;
  const book = getBook(slug);
  const n = Number(chapter);

  if (!book || !Number.isInteger(n) || n < 1 || n > book.chapters) {
    return { title: "Library" };
  }

  return {
    title: `${book.name} ${n}`,
    description: `${book.name} chapter ${n} — read the Hebrew text from Sefaria.`,
  };
}

interface CoverVars extends CSSProperties {
  "--cover-bg": string;
  "--cover-fg": string;
  "--cover-accent": string;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book: slug, chapter } = await params;
  const book = getBook(slug);
  const n = Number(chapter);

  if (!book || !Number.isInteger(n) || n < 1 || n > book.chapters) {
    notFound();
  }

  const content = await fetchText(`${book.sefaria}.${n}`);
  const verses = content?.hebrew ?? [];
  const verseCount = verses.length;
  const verseWord = verseCount === 1 ? "verse" : "verses";

  const prev = n > 1 ? n - 1 : null;
  const next = n < book.chapters ? n + 1 : null;
  const progress = Math.round((n / book.chapters) * 100);

  const palette = bookPalette(book.slug);
  const coverVars: CoverVars = {
    "--cover-bg": palette.bg,
    "--cover-fg": palette.fg,
    "--cover-accent": palette.accent,
  };

  const sefariaUrl = `https://www.sefaria.org/${book.sefaria.replace(
    / /g,
    "_",
  )}.${n}`;

  return (
    <main id="top" className="container chapter-page" style={coverVars}>
      <nav className="book-breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <Link href={`/library/${book.slug}`}>{book.name}</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="book-breadcrumb-current" aria-current="page">
          Chapter {n}
        </span>
      </nav>

      <header className="chapter-hero">
        <div className="chapter-hero-copy">
          <p className="chapter-kicker">
            <Link href={`/library/${book.slug}`}>{book.name}</Link>
            <span className="chapter-kicker-sep" aria-hidden="true">
              ·
            </span>
            {book.section}
            <span className="chapter-kicker-sep" aria-hidden="true">
              ·
            </span>
            <span lang="he">{SECTION_HEBREW[book.section]}</span>
          </p>

          <h1 className="chapter-title" id="chapter-heading">
            <span className="chapter-title-word">Chapter</span>{" "}
            <span className="chapter-title-num">{n}</span>
          </h1>

          <p className="chapter-meta">
            {verseCount > 0 ? `${verseCount} ${verseWord}` : "Text unavailable"}
            <span aria-hidden="true"> · </span>
            Hebrew text
          </p>
        </div>

        <div className="chapter-progress">
          <span className="chapter-progress-label">
            <span>
              Chapter {n} of {book.chapters}
            </span>
            <span>{progress}%</span>
          </span>
          <div
            className="chapter-progress-track"
            role="progressbar"
            aria-label="Chapter progress"
            aria-valuemin={1}
            aria-valuemax={book.chapters}
            aria-valuenow={n}
            aria-valuetext={`Chapter ${n} of ${book.chapters}`}
          >
            <span
              className="chapter-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <article className="manuscript" aria-labelledby="chapter-heading">
        <span className="manuscript-ribbon" aria-hidden="true">
          {n}
        </span>

        <header className="manuscript-head">
          <span className="manuscript-book">{book.name}</span>
          <span className="manuscript-dot" aria-hidden="true">
            ·
          </span>
          <span className="manuscript-he" lang="he" dir="rtl">
            פרק {n}
          </span>
        </header>

        {verseCount > 0 ? (
          <>
            <ol className="chapter-reader" role="list">
              {verses.map((verse, index) => (
                <li
                  className="chapter-verse"
                  key={index}
                  id={`verse-${index + 1}`}
                >
                  <span
                    className="chapter-verse-num"
                    aria-label={`Verse ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  <p
                    className="chapter-verse-text"
                    dir="rtl"
                    lang="he"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeSefariaHtml(verse),
                    }}
                  />
                </li>
              ))}
            </ol>

            <footer className="manuscript-foot">
              <span>End of chapter {n}</span>
            </footer>
          </>
        ) : (
          <div className="chapter-error">
            <p className="chapter-error-title">
              This chapter couldn&apos;t be loaded.
            </p>
            <p className="chapter-error-text">
              The text service may be temporarily unavailable.
            </p>
            <a
              className="chapter-error-link"
              href={sefariaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open it on Sefaria <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </article>

      <nav
        className={`book-pager chapter-pager${
          book.chapters === 1 ? " chapter-pager-single" : ""
        }`}
        aria-label="Chapter navigation"
      >
        <Link
          href={
            prev
              ? `/library/${book.slug}/${prev}`
              : `/library/${book.slug}`
          }
          className="book-pager-link book-pager-prev"
        >
          <span className="book-pager-dir" aria-hidden="true">
            ←
          </span>
          <span className="book-pager-text">
            <small>{prev ? "Previous chapter" : "Book contents"}</small>
            <strong>{prev ? `Chapter ${prev}` : "All chapters"}</strong>
          </span>
        </Link>

        {book.chapters > 1 && (
          <Link
            href={
              next
                ? `/library/${book.slug}/${next}`
                : `/library/${book.slug}`
            }
            className="book-pager-link book-pager-next"
          >
            <span className="book-pager-text">
              <small>{next ? "Next chapter" : "Book contents"}</small>
              <strong>{next ? `Chapter ${next}` : "All chapters"}</strong>
            </span>
            <span className="book-pager-dir" aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </nav>

      <footer className="chapter-foot">
        <a className="chapter-top-link" href="#top">
          ↑ Back to top
        </a>
        <p className="chapter-source">
          Hebrew text from{" "}
          <a href={sefariaUrl} target="_blank" rel="noopener noreferrer">
            Sefaria <span aria-hidden="true">↗</span>
          </a>
        </p>
      </footer>
    </main>
  );
}
