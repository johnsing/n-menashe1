// app/library/parashat/[slug]/page.tsx — read a weekly portion (Hebrew only)
// Fetches the portion's full range from the free Sefaria API, cached 24h.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PARASHIYOT,
  getParasha,
  parashaIndex,
} from "@/app/data/parashat-data";
import { sanitizeSefariaHtml } from "@/app/utils/sefaria";
import "@/app/library/css/reader.css";

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
  return { title: parasha ? parasha.name : "Parashat" };
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
  const verses = content?.hebrew.length ?? 0;

  const idx = parashaIndex(slug);
  const prev = idx > 0 ? PARASHIYOT[idx - 1] : null;
  const next =
    idx >= 0 && idx < PARASHIYOT.length - 1 ? PARASHIYOT[idx + 1] : null;

  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">Library</Link> /{" "}
          <Link href="/library/parashat">Parashat</Link>
        </p>
        <h1>
          <span className="parasha-he" lang="he">{parasha.hebrew}</span>{" "}
          {parasha.name}
        </h1>
        <p className="muted">{parasha.range}</p>
      </header>

      {!content || verses === 0 ? (
        <div className="card">
          <p className="muted">
            Couldn&apos;t load this portion right now.{" "}
            <a
              href={`https://www.sefaria.org/${parasha.ref}`}
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
