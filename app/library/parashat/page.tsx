// app/library/parashat/page.tsx — index of the 54 weekly portions
import Link from "next/link";
import type { Metadata } from "next";
import { PARASHIYOT } from "@/app/data/parashat-data";

export const metadata: Metadata = { title: "Parashat" };

const BOOK_LABELS: Record<string, string> = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
};

export default function ParashatIndexPage() {
  const books = [...new Set(PARASHIYOT.map((p) => p.book))];

  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">Library</Link>
        </p>
        <h1>Parashat HaShavua</h1>
      </header>

      {books.map((book) => (
        <section key={book} className="book-section mb-8">
          <h2 className="section-title text-xl font-semibold mb-4">
            {BOOK_LABELS[book] ?? book}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PARASHIYOT.filter((p) => p.book === book).map((p) => (
              <Link
                key={p.slug}
                href={`/library/parashat/${p.slug}`}
                className="card book-card p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <span className="parasha-he" lang="he">{p.hebrew}</span>
                <strong>{p.name}</strong>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
