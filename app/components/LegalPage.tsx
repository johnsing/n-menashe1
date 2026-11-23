import Link from "next/link";
import type { ReactNode } from "react";

import { formatDateIL, formatPhoneIL, telHrefIL } from "@/app/lib/format";
import { site } from "@/app/lib/site";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <article className="legal-page" lang="he" dir="rtl">
      <header className="legal-head">
        <p className="legal-kicker">{site.name}</p>
        <h1>{title}</h1>
        <p className="legal-updated">
          עודכן לאחרונה:{" "}
          <time dateTime={site.lastUpdated} dir="ltr">
            {formatDateIL(site.lastUpdated)}
          </time>
        </p>
        <div className="legal-intro">{intro}</div>
      </header>

      <nav className="legal-toc" aria-label="תוכן העמוד">
        <h2>תוכן העמוד</h2>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="legal-section"
          aria-labelledby={`${section.id}-title`}
        >
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          <div className="legal-prose">{section.content}</div>
        </section>
      ))}

      <section
        className="legal-section"
        aria-labelledby="legal-contact-title"
      >
        <h2 id="legal-contact-title">יצירת קשר</h2>
        <div className="legal-prose">
          <p>
            בשאלות בנושא מסמך זה ניתן לפנות אלינו. נשמח לסייע גם בבקשות
            הנוגעות לנגישות האתר.
          </p>
          <ul>
            <li>
              דואר אלקטרוני:{" "}
              <a href={`mailto:${site.email}`} dir="ltr">
                {site.email}
              </a>
            </li>
            <li>
              רכז נגישות:{" "}
              <a href={`mailto:${site.accessibilityEmail}`} dir="ltr">
                {site.accessibilityEmail}
              </a>
            </li>
            <li>
              טלפון:{" "}
              <a href={telHrefIL(site.phoneRaw)} dir="ltr">
                {formatPhoneIL(site.phoneRaw)}
              </a>
            </li>
            <li>
              <Link href="/contact">טופס יצירת קשר</Link>
            </li>
          </ul>
        </div>
      </section>
    </article>
  );
}
