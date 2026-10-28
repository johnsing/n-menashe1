// app/library/[book]/page.tsx — all chapters of one book
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BOOKS, getBook } from "@/app/data/data";

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
  return { title: book ? book.name : "Library" };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ book: string }>;
}) {
  const { book: slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <main className="container">
      <header className="hero">
        <p className="muted">
          <Link href="/library">← Library</Link>
        </p>
        <h1>{book.name}</h1>
        <p className="muted">
          {book.section} · {book.chapters} chapters
        </p>
      </header>

      <div className="grid">
        {chapters.map((n) => (
          <Link
            key={n}
            href={`/library/${book.slug}/${n}`}
            className="card book-card"
          >
            <strong>Chapter {n}</strong>
          </Link>
        ))}
      </div>
    </main>
  );
}
