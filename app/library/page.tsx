"use client";
// app/library/page.tsx — Tanakh index: sections → books → chapters with section tabs

import { useState } from "react";
import Link from "next/link";
import { SECTIONS, booksBySection } from "./data";

export default function LibraryPage() {
  // Default to the first section (e.g., Torah) instead of "all"
  const [activeTab, setActiveTab] = useState<(typeof SECTIONS)[number]>(SECTIONS[0]);

  return (
    <main className="container">
      <header className="hero">
        <h1>Library</h1>
        <p className="muted">The books of the Tanakh — tap a book to see its chapters</p>
      </header>

      {/* Tabs Navigation (Sections Only) */}
      <div className="flex gap-2 border-b border-gray-200 pb-4 mb-8 overflow-x-auto">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveTab(section)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === section
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Active Section and Book Grid */}
      <section className="book-section mb-8">
        <h2 className="section-title text-xl font-semibold mb-4">{activeTab}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {booksBySection(activeTab).map((book) => (
            <Link
              key={book.slug}
              href={`/library/${book.slug}`}
              className="card book-card p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <strong>{book.name}</strong>
              <small className="muted text-gray-500">
                {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"}
              </small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}