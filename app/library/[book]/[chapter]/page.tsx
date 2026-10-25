// app/library/[book]/[chapter]/page.tsx — read one chapter (Hebrew + English)
// Text comes from the free Sefaria API (no key required) and is cached
// for 24h so repeat visits are instant.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "../../data";
import "@/app/library/reader.css";

export const revalidate = 86400; // ISR: cache chapter text for a day

interface SefariaResponse {
  ref?: string;
  text?: string[] | string[][];
  he?: string[] | string[][];
  error?: string;
}

/** Normalize Sefaria's text shape to a flat array of verses. */
function toVerses(data?: string[] | string[][]): string[] {
  if (!data) return [];
  if (typeof data === "string") return [data];
  return data.flatMap((v) => (Array.isArray(v) ? v : [v]));
}

async function fetchChapter(ref: string) {
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
    ref,
  )}?context=0&commentary=0`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as SefariaResponse;
  if (data.error) return null;
  return {
    hebrew: toVerses(data.he),
    english: toVerses(data.text),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}): Promise<Metadata> {
  const { book: slug, chapter } = await params;
  const book = getBook(slug);
  const n = Number(chapter);
  return { title: book ? `${book.name} ${n}` : "Library" };
}

/** 
 * Helper function to strip HTML tags, convert non-breaking spaces 
 * to regular spaces, and clean up extra punctuation artifacts. 
 */
const cleanText = (html: string) => {
  if (!html) return "";
  return html
    .replace(/&nbsp;/gi, " ")   // Replace &nbsp; with a space
    .replace(/&thinsp;/gi, " ") // Replace &thinsp; with a space
    .replace(/<[^>]*>?/gm, "")  // Remove HTML tags
    .replace(/;/g, "")          // Remove stray semicolons
    .replace(/׀/g, "")          // Remove Hebrew vertical line separator (sof pasuq variant)
    .replace(/\s+/g, " ")       // Normalize multiple consecutive spaces into one
    .trim();
};

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

  const content = await fetchChapter(`${book.sefaria}.${n}`);
  const verses = Math.max(
    content?.hebrew.length ?? 0,
    content?.english.length ?? 0,
  );

  const prev = n > 1 ? n - 1 : null;
  const next = n < book.chapters ? n + 1 : null;

  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">Library</Link> /{" "}
          <Link href={`/library/${book.slug}`}>{book.name}</Link>
        </p>
        <h1>
          {book.name} {n}
        </h1>
      </header>

      {!content || verses === 0 ? (
        <div className="card">
          <p className="muted">
            Couldn&apos;t load this chapter right now.{" "}
            <a
              href={`https://www.sefaria.org/${book.sefaria}.${n}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open it on Sefaria ↗
            </a>
          </p>
        </div>
      ) : (
        <article className="reader">
          {content.hebrew.map((hebrewText, index) => {
            const verseNum = index + 1;
            const englishText = content.english?.[index] ?? "";

            return (
              <div key={`verse-${verseNum}`} className="verse">
                <span className="verse-num" aria-hidden="true">{verseNum}</span>
                <p className="verse-he" dir="rtl" lang="he">
                  {cleanText(hebrewText)}
                </p>
                <p className="verse-en">
                  {cleanText(englishText)}
                </p>
              </div>
            );
          })}
        </article>
      )}

      <nav className="reader-nav">
        {prev ? (
          <Link className="btn" href={`/library/${book.slug}/${prev}`}>
            ← Ch. {prev}
          </Link>
        ) : (
          <Link className="btn" href={`/library/${book.slug}`}>
            ← All chapters
          </Link>
        )}
        {next && (
          <Link className="btn" href={`/library/${book.slug}/${next}`}>
            Ch. {next} →
          </Link>
        )}
      </nav>
    </main>
  );
}