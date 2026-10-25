// app/library/page.tsx — Tanakh index: sections → books → chapters
import Link from "next/link";
import { SECTIONS, booksBySection } from "./data";

export default function LibraryPage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>Library</h1>
        <p className="muted">The books of the Tanakh — tap a book to see its chapters</p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section} className="book-section">
          <h2 className="section-title">{section}</h2>
          <div className="grid">
            {booksBySection(section).map((book) => (
              <Link
                key={book.slug}
                href={`/library/${book.slug}`}
                className="card book-card"
              >
                <strong>{book.name}</strong>
                <small className="muted">
                  {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
                </small>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
