"use client";
// app/components/library/AliyahReader.tsx
// Weekly portion reader with:
//   · aliyah tabs (All + 7)
//   · two views: "Bilingual" (Hebrew+English) and "Tikkun" (pointed + unpointed,
//     like a traditional tikkun for Torah-reading practice)
// Receives plain data from the server page — no fetching here.
import { useMemo, useState } from "react";

interface Verse {
  num: number;        // continuous number within the portion
  he: string;         // pointed Hebrew (may contain Sefaria HTML)
  en: string;         // English (may contain Sefaria HTML)
  ref: string;        // Hebrew chapter:verse label, e.g. "א:א"
}

interface Aliyah {
  label: string;      // "First Aliyah"
  he: string;         // "ראשון"
  verses: Verse[];
}

/** Remove vowel points & cantillation marks → scroll-style unpointed text.
 *  Keeps dagesh (ּ) and shin/sin dots (ׁׂ) so letters stay readable.
 *  Also strips Sefaria's inline HTML (<b>, <i>, <small>, footnotes…). */
function toUnpointed(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0591-\u05AF\u05B0-\u05BD\u05BF\u05C4-\u05C6]/g, "");
}

export default function AliyahReader({
  hebrew,
  english,
  alts,
  refs,
}: {
  hebrew: string[];
  english: string[];
  alts: ({ aliyah_en?: string; aliyah_he?: string } | null)[];
  refs: string[]; // "א:א" style labels, parallel to hebrew/english
}) {
  const aliyot = useMemo<Aliyah[]>(() => {
    const count = Math.max(hebrew.length, english.length);
    const result: Aliyah[] = [];
    let current: Aliyah | null = null;

    for (let i = 0; i < count; i++) {
      const alt = alts[i];
      if (alt?.aliyah_en) {
        current = { label: `${alt.aliyah_en} Aliyah`, he: alt.aliyah_he ?? "", verses: [] };
        result.push(current);
      }
      if (!current) {
        current = { label: "Torah Reading", he: "", verses: [] };
        result.push(current);
      }
      current.verses.push({
        num: i + 1,
        he: hebrew[i] ?? "",
        en: english[i] ?? "",
        ref: refs[i] ?? String(i + 1),
      });
    }
    return result;
  }, [hebrew, english, alts, refs]);

  const [active, setActive] = useState(0); // 0 = All
  const [view, setView] = useState<"bilingual" | "tikkun">("bilingual");

  const shown: Verse[] =
    active === 0 ? aliyot.flatMap((a) => a.verses) : aliyot[active - 1]?.verses ?? [];
  const allCount = aliyot.reduce((n, a) => n + a.verses.length, 0);

  return (
    <div>
      {/* View toggle */}
      <div className="view-toggle" role="tablist" aria-label="View">
        <button
          role="tab"
          aria-selected={view === "bilingual"}
          className={`view-toggle-btn${view === "bilingual" ? " is-active" : ""}`}
          onClick={() => setView("bilingual")}
        >
          Bilingual
        </button>
        <button
          role="tab"
          aria-selected={view === "tikkun"}
          className={`view-toggle-btn${view === "tikkun" ? " is-active" : ""}`}
          onClick={() => setView("tikkun")}
        >
          📖 Tikkun
        </button>
      </div>

      {/* Aliyah tabs */}
      <div className="aliyah-tabs" role="tablist" aria-label="Aliyot">
        <button
          role="tab"
          aria-selected={active === 0}
          className={`aliyah-tab${active === 0 ? " is-active" : ""}`}
          onClick={() => setActive(0)}
        >
          All <span className="aliyah-count">{allCount}</span>
        </button>
        {aliyot.map((a, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i + 1}
            className={`aliyah-tab${active === i + 1 ? " is-active" : ""}`}
            onClick={() => setActive(i + 1)}
          >
            <span className="aliyah-tab-num">{i + 1}</span>
            {a.he && (
              <span className="aliyah-tab-he" lang="he">
                {a.he}
              </span>
            )}
          </button>
        ))}
      </div>

      {active > 0 && aliyot[active - 1] && (
        <p className="aliyah-heading">
          {aliyot[active - 1].label}
          {aliyot[active - 1].he && (
            <span className="aliyah-he" lang="he">
              {" "}
              · {aliyot[active - 1].he}
            </span>
          )}{" "}
          · {aliyot[active - 1].verses.length} verses
        </p>
      )}

      {/* ── Bilingual view ── */}
      {view === "bilingual" && (
        <article className="reader">
          {shown.map((v) => (
            <div key={v.num} className="verse">
              <span className="verse-num">{v.num}</span>
              {/* Sefaria text contains legitimate HTML (footnotes,
                  ta'amim markers) — static, trusted source */}
              <p className="verse-he" dir="rtl" lang="he" dangerouslySetInnerHTML={{ __html: v.he }} />
              <p className="verse-en" dangerouslySetInnerHTML={{ __html: v.en }} />
            </div>
          ))}
        </article>
      )}

      {/* ── Tikkun view (tikkun.io style): pointed + unpointed ── */}
      {view === "tikkun" && (
        <article className="tikkun" dir="rtl" lang="he">
          {shown.map((v) => (
            <div key={v.num} className="tikkun-verse">
              <span className="tikkun-ref">{v.ref}</span>
              <p
                className="tikkun-pointed"
                dangerouslySetInnerHTML={{ __html: v.he }}
              />
              <p className="tikkun-scroll">{toUnpointed(v.he)}</p>
            </div>
          ))}
        </article>
      )}
    </div>
  );
}
