"use client";
// app/library/page.tsx — Tanakh index: section tabs + Parashat entry
import { useState } from "react";
import Link from "next/link";
import { SECTIONS, booksBySection } from "@/app/data/data";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<(typeof SECTIONS)[number]>(SECTIONS[0]);

  return (
    <main className="container">
      <header className="hero">
        <h1>Library</h1>
      </header>

      {/* Tabs Navigation (Sections Only) */}
      <div className="library-tabs" role="group" aria-label="Tanakh sections">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => setActiveTab(section)}
            aria-pressed={activeTab === section}
            className={`library-tab${activeTab === section ? " is-active" : ""}`}
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
            </Link>
          ))}
        </div>
      </section>

      <Link
        href="/library/parashat"
        className="card parasha-card parasha-hero p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div className="parasha-title mb-2">
          <strong>Parashat HaShavua</strong>
        </div>
      </Link>
    </main>
  );
}
