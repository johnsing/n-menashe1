// app/library/page.tsx — Tanakh index with section tabs + Parashat entry
"use client";

import { useState } from "react";
import Link from "next/link";
import { SECTIONS, booksBySection } from "../data/data";
import { FaTorah } from "react-icons/fa";

export default function LibraryPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof SECTIONS)[number]>(SECTIONS[0]);

  return (
    <main className="container">
      <header className="hero">
        <h1>Library</h1>
        <p className="muted">
          The books of the Tanakh — tap a book to see its chapters
        </p>
      </header>

      {/* Section tabs — styled by .view-toggle/.toggle-btn in globals.css */}
      <div className="view-toggle" role="tablist" aria-label="Tanakh sections">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            aria-selected={activeTab === section}
            onClick={() => setActiveTab(section)}
            className={`toggle-btn${activeTab === section ? " is-active" : ""}`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Active section's books */}
      <section className="book-section">
        <h2 className="section-title">{activeTab}</h2>
        <div className="grid">
          {booksBySection(activeTab).map((book) => (
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

      {/* Weekly Torah portions */}
      <section className="book-section">
        <Link href="/library/parashat" className="card book-card">
          <strong><FaTorah />Parashat — Weekly Portions</strong>
        </Link>
      </section>
    </main>
  );
}