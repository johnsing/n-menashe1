// app/library/[book]/[chapter]/page.tsx — read one chapter, Hebrew only
// Text comes from the free Sefaria API (no key required), cached 24h.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "@/app/data/data";
import { sanitizeSefariaHtml } from "@/app/utils/sefaria";
import "@/app/library/css/reader.css";

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
  return { title: book ? `${book.name} ${chapter}` : "Library" };
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
  const verses = content?.hebrew.length ?? 0;

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
          {Array.from({ length: verses }, (_, i) => (
            <div key={i} className="verse">
              <span className="verse-num">{i + 1}</span>
              <p
                className="verse-he"
                dir="rtl"
                lang="he"
                dangerouslySetInnerHTML={{
                  __html: sanitizeSefariaHtml(content.hebrew[i] ?? ""),
                }}
              />
            </div>
          ))}
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
