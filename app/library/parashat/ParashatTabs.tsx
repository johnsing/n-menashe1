"use client";
// Tab bar for the five Torah books; shows that book's portions.
import { useState } from "react";
import Link from "next/link";
import { parashatByBook, type Parasha } from "../parashat";

interface Book {
  id: Parasha["book"];
  label: string;
}

export default function ParashatTabs({ books }: { books: Book[] }) {
  const [active, setActive] = useState<Book["id"]>("genesis");
  const portions = parashatByBook(active);

  return (
    <>
      <div className="ptabs" role="tablist" aria-label="Torah books">
        {books.map((b) => (
          <button
            key={b.id}
            role="tab"
            aria-selected={active === b.id}
            className={`ptab${active === b.id ? " is-active" : ""}`}
            onClick={() => setActive(b.id)}
          >
            {b.label.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="stack" role="tabpanel">
        {portions.map((p) => (
          <Link
            key={p.slug}
            href={`/library/parashat/${p.slug}`}
            className="card parasha-card"
          >
            <div className="parasha-title">
              <strong>
                {p.name}{" "}
                <span className="parasha-he" dir="rtl" lang="he">
                  {p.hebrew}
                </span>
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}