// app/library/parashat/[slug]/page.tsx — read one weekly portion (Hebrew only).
// Fetches the portion's full range from the free Sefaria API, cached 24h.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  CHUMASH_HEBREW,
  CHUMASH_LABELS,
  PARASHIYOT,
  getParasha,
  parashaIndex,
} from "@/app/data/parashat-data";
import { bookPalette } from "@/app/lib/bookDesign";
import { sanitizeSefariaHtml } from "@/app/utils/sefaria";

export const revalidate = 86400; // ISR

interface SefariaResponse {
  ref?: string;
  he?: string[] | string[][];
  error?: string;
}

/** Sefaria returns ranges nested by chapter → flatten to one verse list. */
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

// All 54 portions are generated at build time.
export function generateStaticParams() {
  return PARASHIYOT.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parasha = getParasha(slug);

  return {
    title: parasha ? parasha.name : "Parashat",
    description: parasha
      ? `${parasha.name} — ${parasha.range}. Read the Hebrew text of this Torah portion from Sefaria.`
      : undefined,
  };
}

interface CoverVars extends CSSProperties {
  "--cover-bg": string;
  "--cover-fg": string;
  "--cover-accent": string;
}

export default async function ParashatReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parasha = getParasha(slug);
  if (!parasha) notFound();

  const content = await fetchText(parasha.ref);
  const verses = content?.hebrew ?? [];
  const verseCount = verses.length;

  const idx = parashaIndex(slug);
  const prev = idx > 0 ? PARASHIYOT[idx - 1] : null;
  const next =
    idx >= 0 && idx < PARASHIYOT.length - 1 ? PARASHIYOT[idx + 1] : null;

  const total = PARASHIYOT.length;
  const portionNumber = idx + 1;
  const progress = Math.round((portionNumber / total) * 100);

  const bookLabel = CHUMASH_LABELS[parasha.book] ?? parasha.book;
  const bookHebrew = CHUMASH_HEBREW[parasha.book] ?? "";
  const palette = bookPalette(parasha.book);
  const coverVars: CoverVars = {
    "--cover-bg": palette.bg,
    "--cover-fg": palette.fg,
    "--cover-accent": palette.accent,
  };

  const sefariaUrl = `https://www.sefaria.org/${parasha.ref}`;

  return (
    <main id="top" className="container parashat-reader-page" style={coverVars}>
      <nav className="book-breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <Link href="/library/parashat">Parashat</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="book-breadcrumb-current" aria-current="page">
          {parasha.name}
        </span>
      </nav>

      <header className="parashat-reader-hero">
        <div className="parashat-reader-hero-copy">
          <p className="parashat-reader-kicker">
            <Link href="/library/parashat">Parashat HaShavua</Link>
            <span className="parashat-reader-kicker-sep" aria-hidden="true">
              ·
            </span>
            <Link href={`/library/${parasha.book}`}>{bookLabel}</Link>
            {bookHebrew && (
              <>
                <span className="parashat-reader-kicker-sep" aria-hidden="true">
                  ·
                </span>
                <span lang="he">{bookHebrew}</span>
              </>
            )}
          </p>

          <h1 className="parashat-reader-title" id="parashat-heading">
            <span className="parashat-reader-name">{parasha.name}</span>{" "}
            <span className="parashat-reader-he" lang="he" dir="rtl">
              {parasha.hebrew}
            </span>
          </h1>

          <p className="parashat-reader-meta">
            {parasha.range}
            <span aria-hidden="true"> · </span>
            Hebrew text
          </p>
        </div>

        <div className="parashat-reader-progress">
          <span className="parashat-reader-progress-label">
            <span>
              Portion {portionNumber} of {total}
            </span>
            <span>{progress}%</span>
          </span>
          <div
            className="parashat-reader-progress-track"
            role="progressbar"
            aria-label="Annual cycle progress"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={portionNumber}
            aria-valuetext={`Portion ${portionNumber} of ${total}`}
          >
            <span
              className="parashat-reader-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="parashat-scroll">
        <div className="parashat-roller parashat-roller-top" aria-hidden="true" />

        <article className="parashat-leaf" aria-labelledby="parashat-heading">
          <span className="parashat-leaf-ribbon" aria-hidden="true">
            {portionNumber}
          </span>

          <header className="parashat-leaf-head">
            <span className="parashat-leaf-book">{bookLabel}</span>
            <span className="parashat-leaf-dot" aria-hidden="true">
              ·
            </span>
            <span className="parashat-leaf-name">
              Parashat {parasha.name}
            </span>
            <span className="parashat-leaf-dot" aria-hidden="true">
              ·
            </span>
            <span className="parashat-leaf-he" lang="he" dir="rtl">
              {parasha.hebrew}
            </span>
          </header>

          {verseCount > 0 ? (
            <>
              <ol className="parashat-verse-list" role="list">
                {verses.map((verse, index) => (
                  <li
                    className="parashat-verse"
                    key={index}
                    id={`verse-${index + 1}`}
                  >
                    <span
                      className="parashat-verse-num"
                      aria-label={`Verse ${index + 1}`}
                    >
                      {index + 1}
                    </span>
                    <p
                      className="parashat-verse-text"
                      dir="rtl"
                      lang="he"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeSefariaHtml(verse),
                      }}
                    />
                  </li>
                ))}
              </ol>

              <footer className="parashat-leaf-foot">
                <span>End of Parashat {parasha.name}</span>
              </footer>
            </>
          ) : (
            <div className="parashat-reader-error">
              <p className="parashat-reader-error-title">
                This portion couldn&apos;t be loaded.
              </p>
              <p className="parashat-reader-error-text">
                The text service may be temporarily unavailable.
              </p>
              <a
                className="parashat-reader-error-link"
                href={sefariaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open it on Sefaria <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </article>

        <div
          className="parashat-roller parashat-roller-bottom"
          aria-hidden="true"
        />
      </div>

      <nav
        className="book-pager parashat-reader-pager"
        aria-label="Parashat navigation"
      >
        <Link
          href={prev ? `/library/parashat/${prev.slug}` : "/library/parashat"}
          className="book-pager-link book-pager-prev"
        >
          <span className="book-pager-dir" aria-hidden="true">
            ←
          </span>
          <span className="book-pager-text">
            <small>{prev ? "Previous portion" : "Parashat index"}</small>
            <strong>{prev ? prev.name : "All portions"}</strong>
          </span>
        </Link>

        <Link
          href={next ? `/library/parashat/${next.slug}` : "/library/parashat"}
          className="book-pager-link book-pager-next"
        >
          <span className="book-pager-text">
            <small>{next ? "Next portion" : "Parashat index"}</small>
            <strong>{next ? next.name : "All portions"}</strong>
          </span>
          <span className="book-pager-dir" aria-hidden="true">
            →
          </span>
        </Link>
      </nav>

      <footer className="parashat-reader-foot">
        <a className="parashat-reader-top-link" href="#top">
          ↑ Back to top
        </a>
        <p className="parashat-reader-source">
          Hebrew text from{" "}
          <a href={sefariaUrl} target="_blank" rel="noopener noreferrer">
            Sefaria <span aria-hidden="true">↗</span>
          </a>
        </p>
      </footer>
    </main>
  );
}
