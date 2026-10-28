// app/library/parashat/[slug]/page.tsx — weekly portion: aliyah tabs
// + Bilingual/Tikkun views. Fetches Hebrew/English + aliyah markers from
// Sefaria (cached 24h), hands plain data to <AliyahReader>.
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PARASHIYOT,
  getParasha,
  parashaIndex,
} from "@/app/data/parashat-data";
import AliyahReader from "@/app/components/library/AliyahReader";
import "@/app/library/css/reader.css";

export const revalidate = 86400; // ISR

interface Alt {
  aliyah_en?: string;
  aliyah_he?: string;
}
type AltEntry = Alt | Alt[] | null;

interface SefariaResponse {
  ref?: string;
  text?: string[] | string[][];
  he?: string[] | string[][];
  alts?: AltEntry[];
  error?: string;
}

/** Flatten possibly chapter-nested text and remember each verse's chapter. */
function toVerses(
  data?: string[] | string[][],
): { verses: string[]; chapters: number[] } {
  if (!data) return { verses: [], chapters: [] };
  if (typeof data === "string") return { verses: [data], chapters: [1] };
  const verses: string[] = [];
  const chapters: number[] = [];
  data.forEach((chapter, ci) => {
    const list = Array.isArray(chapter) ? chapter : [chapter];
    for (const v of list) {
      verses.push(v);
      chapters.push(ci + 1);
    }
  });
  return { verses, chapters };
}

/** `alts` is parallel to verses; may be nested by chapter → flatten. */
function toAlts(alts?: AltEntry[]): (Alt | null)[] {
  if (!alts) return [];
  return alts.flatMap((a) => (Array.isArray(a) ? a : [a])) as (Alt | null)[];
}

// ── Hebrew numerals (for א:א style verse labels; Tanakh max is 150) ──
const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"]; // 100–400

export function toHebrewNumeral(n: number): string {
  if (n <= 0) return String(n);
  if (n === 15) return "ט״ו"; // avoid י-ה
  if (n === 16) return "ט״ז"; // avoid י-ו
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const t = Math.floor(rest / 10);
  const o = rest % 10;
  let s = "";
  if (h > 0) s += h <= 4 ? HUNDREDS[h] : "ת" + HUNDREDS[h - 4]; // 500–800
  s += TENS[t] + ONES[o];
  return s.length > 1 ? `${s.slice(0, -1)}״${s.slice(-1)}` : s;
}

async function fetchPortion(ref: string) {
  const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(
    ref,
  )}?context=0&commentary=0`;
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) return null;
  const data = (await res.json()) as SefariaResponse;
  if (data.error) return null;

  const he = toVerses(data.he);
  const en = toVerses(data.text);
  const count = Math.max(he.verses.length, en.verses.length);
  const chapters =
    he.chapters.length >= en.chapters.length ? he.chapters : en.chapters;

  // Verse number within its own chapter (1, 2, 3… per chapter)
  const verseNums: number[] = [];
  for (let i = 0; i < count; i++) {
    verseNums.push(
      i === 0 || chapters[i] !== chapters[i - 1] ? 1 : verseNums[i - 1] + 1,
    );
  }
  const refs = Array.from(
    { length: count },
    (_, i) =>
      `${toHebrewNumeral(chapters[i] ?? 1)}:${toHebrewNumeral(verseNums[i])}`,
  );

  return {
    verses: he.verses,
    english: en.verses,
    alts: toAlts(data.alts),
    refs,
  };
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

  const content = await fetchPortion(parasha.ref);

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
          <span className="parasha-he" lang="he">
            {" "}
            {parasha.hebrew}{" "}
          </span>{" "}
          {parasha.name}
        </h1>
        <p className="muted">{parasha.range}</p>
      </header>

      {!content || content.verses.length === 0 ? (
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
        <AliyahReader
          hebrew={content.verses}
          english={content.english}
          alts={content.alts}
          refs={content.refs}
        />
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
