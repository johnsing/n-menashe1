// app/library/parashat/[parasha]/page.tsx — read one weekly portion
// Text: Sefaria API (free, no key). Multi-chapter portions arrive as an
// array of arrays (chapter → verses), so we render one block per chapter.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PARASHAT, getParasha } from "../../parashat";
import "@/app/library/parashot.css";

export const revalidate = 86400; // cache portion text for a day

const HEBREW_BOOK_NAME: Record<string, string> = {
  Genesis: "בראשית",
  Exodus: "שמות",
  Leviticus: "ויקרא",
  Numbers: "במדבר",
  Deuteronomy: "דברים",
};

interface SefariaResponse {
  ref?: string;
  he?: unknown;
  text?: unknown;
  aliyot?: string[];
  error?: string;
}

type Verses = string[];

/** Normalize Sefaria's shape into chapter segments (or a single segment). */
function toSegments(data: unknown): Verses[] {
  if (!data) return [];
  if (typeof data === "string") return [[data]];
  if (!Array.isArray(data)) return [];
  // Multi-chapter: array of verse-arrays. Single chapter: array of strings.
  const maybeNested = data as unknown[];
  if (maybeNested.some((v) => Array.isArray(v))) {
    return maybeNested.map((seg) =>
      Array.isArray(seg) ? seg.map(String) : [String(seg)],
    );
  }
  return [maybeNested.map(String)];
}

/** Parse "Genesis.41.1-44.17" → { book: "Genesis", startCh: 41, endCh: 44 } */
function parseRef(ref: string) {
  const parts = ref.split(".");
  const book = parts[0];
  const range = parts.slice(1).join("."); // "41.1-44.17" or "16.1-18.30"
  const [start, end] = range.split("-");
  const startCh = Number(start?.split(".")[0] ?? 1);
  const endPart = end ?? start;
  const endCh = Number(endPart?.split(".")[0] ?? startCh);
  return { book, startCh, endCh };
}

async function fetchPortion(ref: string) {
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
    ref,
  )}?context=0&commentary=0`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as SefariaResponse;
  if (data.error) return null;
  return {
    hebrew: toSegments(data.he),
    english: toSegments(data.text),
    aliyot: data.aliyot ?? [],
  };
}

export function generateStaticParams() {
  return PARASHAT.map((p) => ({ parasha: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ parasha: string }>;
}): Promise<Metadata> {
  const { parasha } = await params;
  const p = getParasha(parasha);
  return { title: p ? `Parashat ${p.name}` : "Parashat" };
}

export default async function ParashaPage({
  params,
}: {
  params: Promise<{ parasha: string }>;
}) {
  const { parasha } = await params;
  const portion = getParasha(parasha);
  if (!portion) notFound();

  const content = await fetchPortion(portion.ref);
  const { book, startCh, endCh } = parseRef(portion.ref);
  const heBook = HEBREW_BOOK_NAME[book] ?? book;
  const multiChapter = endCh > startCh;

  const idx = PARASHAT.findIndex((p) => p.slug === portion.slug);
  const prev = idx > 0 ? PARASHAT[idx - 1] : null;
  const next = idx < PARASHAT.length - 1 ? PARASHAT[idx + 1] : null;

  const segments = Math.max(
    content?.hebrew.length ?? 0,
    content?.english.length ?? 0,
  );

  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">Library</Link> /{" "}
          <Link href="/library/parashat">Parashat</Link>
        </p>
        <h1>
          {portion.name}{" "}
          <span className="parasha-he" dir="rtl" lang="he">
            {portion.hebrew}
          </span>
        </h1>
        <p className="muted">{portion.summary}</p>
      </header>

      {!content || segments === 0 ? (
        <div className="card">
          <p className="muted">
            Couldn&apos;t load this portion right now.{" "}
            <a
              href={`https://www.sefaria.org/${portion.ref.replace(/\./g, ".")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open it on Sefaria ↗
            </a>
          </p>
        </div>
      ) : (
        <article className="reader">
          {Array.from({ length: segments }, (_, i) => {
            const he = content.hebrew[i] ?? [];
            const en = content.english[i] ?? [];
            const chapterNum = startCh + i;
            const verses = Math.max(he.length, en.length);
            return (
              <section key={i}>
                {multiChapter && (
                  <h3 className="chapter-heading">
                    {book} {chapterNum}{" "}
                    <span dir="rtl" lang="he">
                      {heBook} {chapterNum}
                    </span>
                  </h3>
                )}
                {Array.from({ length: verses }, (_, v) => (
                  <div key={v} className="verse">
                    <span className="verse-num">{v + 1}</span>
                    <p className="verse-he" dir="rtl" lang="he">
                      {he[v] ?? ""}
                    </p>
                    <p className="verse-en">{en[v] ?? ""}</p>
                  </div>
                ))}
              </section>
            );
          })}
        </article>
      )}

      {content && content.aliyot.length > 0 && (
        <section className="aliyot-box">
          <h3 className="section-title">Aliyot</h3>
          <ol className="aliya-list">
            {content.aliyot.map((a, i) => (
              <li key={i}>
                <a
                  href={`https://www.sefaria.org/${a.replace(/ /g, "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aliyah {i + 1} · {a}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="reader-nav">
        {prev ? (
          <Link className="btn" href={`/library/parashat/${prev.slug}`}>
            ← {prev.name}
          </Link>
        ) : (
          <Link className="btn" href="/library/parashat">
            ← All portions
          </Link>
        )}
        {next && (
          <Link className="btn" href={`/library/parashat/${next.slug}`}>
            {next.name} →
          </Link>
        )}
      </nav>
    </main>
  );
}
