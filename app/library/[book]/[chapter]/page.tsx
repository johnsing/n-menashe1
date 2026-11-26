import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "@/app/data/data";
import { SECTION_HEBREW, coverVars } from "@/app/lib/bookDesign";
import { pageMetadata } from "@/app/lib/metadata";
import {
  fetchSefariaVerses,
  sanitizeSefariaHtml,
} from "@/app/utils/sefaria";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}): Promise<Metadata> {
  const { book: slug, chapter } = await params;
  const book = getBook(slug);
  const chapterNumber = Number(chapter);

  if (
    !book ||
    !Number.isInteger(chapterNumber) ||
    chapterNumber < 1 ||
    chapterNumber > book.chapters
  ) {
    return pageMetadata({
      title: "Library",
      description: "The full Tanakh — Torah, Nevi'im and Ketuvim, book by book.",
      locale: "en_US",
    });
  }

  return pageMetadata({
    title: `${book.name} ${chapterNumber}`,
    description: `${book.name} chapter ${chapterNumber} — read the Hebrew text from Sefaria.`,
    locale: "en_US",
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>;
}) {
  const { book: slug, chapter } = await params;
  const book = getBook(slug);
  const chapterNumber = Number(chapter);

  if (
    !book ||
    !Number.isInteger(chapterNumber) ||
    chapterNumber < 1 ||
    chapterNumber > book.chapters
  ) {
    notFound();
  }

  const verses =
    (await fetchSefariaVerses(`${book.sefaria}.${chapterNumber}`)) ?? [];
  const verseCount = verses.length;
  const verseWord = verseCount === 1 ? "verse" : "verses";

  const previousChapter = chapterNumber > 1 ? chapterNumber - 1 : null;
  const nextChapter =
    chapterNumber < book.chapters ? chapterNumber + 1 : null;
  const progress = Math.round((chapterNumber / book.chapters) * 100);

  const sefariaUrl = `https://www.sefaria.org/${book.sefaria.replace(
    / /g,
    "_",
  )}.${chapterNumber}`;

  return (
    <div
      id="top"
      className="container chapter-page"
      style={coverVars(book.slug)}
      lang="en"
      dir="ltr"
    >
      <nav className="book-breadcrumb" aria-label="Breadcrumb">
        <Link href="/library">Library</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <Link href={`/library/${book.slug}`}>{book.name}</Link>
        <span className="book-breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="book-breadcrumb-current" aria-current="page">
          Chapter {chapterNumber}
        </span>
      </nav>

      <header className="chapter-hero">
        <div className="chapter-hero-copy">
          <p className="chapter-kicker">
            <Link href={`/library/${book.slug}`}>{book.name}</Link>
            <span className="chapter-kicker-sep" aria-hidden="true">
              ·
            </span>
            {book.section}
            <span className="chapter-kicker-sep" aria-hidden="true">
              ·
            </span>
            <span lang="he">{SECTION_HEBREW[book.section]}</span>
          </p>

          <h1 className="chapter-title" id="chapter-heading">
            <span className="chapter-title-word">Chapter</span>{" "}
            <span className="chapter-title-num">{chapterNumber}</span>
          </h1>

          <p className="chapter-meta">
            {verseCount > 0 ? `${verseCount} ${verseWord}` : "Text unavailable"}
            <span aria-hidden="true"> · </span>
            Hebrew text
          </p>
        </div>

        <div className="chapter-progress">
          <span className="chapter-progress-label">
            <span>
              Chapter {chapterNumber} of {book.chapters}
            </span>
            <span>{progress}%</span>
          </span>
          <div
            className="chapter-progress-track"
            role="progressbar"
            aria-label="Chapter progress"
            aria-valuemin={1}
            aria-valuemax={book.chapters}
            aria-valuenow={chapterNumber}
            aria-valuetext={`Chapter ${chapterNumber} of ${book.chapters}`}
          >
            <span
              className="chapter-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <article className="manuscript" aria-labelledby="chapter-heading">
        <span className="manuscript-ribbon" aria-hidden="true">
          {chapterNumber}
        </span>

        <header className="manuscript-head">
          <span className="manuscript-book">{book.name}</span>
          <span className="manuscript-dot" aria-hidden="true">
            ·
          </span>
          <span className="manuscript-he" lang="he" dir="rtl">
            פרק {chapterNumber}
          </span>
        </header>

        {verseCount > 0 ? (
          <>
            <ol className="chapter-reader" role="list">
              {verses.map((verse, index) => (
                <li
                  className="chapter-verse"
                  key={index}
                  id={`verse-${index + 1}`}
                >
                  <span
                    className="chapter-verse-num"
                    aria-label={`Verse ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  <p
                    className="chapter-verse-text"
                    dir="rtl"
                    lang="he"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeSefariaHtml(verse),
                    }}
                  />
                </li>
              ))}
            </ol>

            <footer className="manuscript-foot">
              <span>End of chapter {chapterNumber}</span>
            </footer>
          </>
        ) : (
          <div className="chapter-error">
            <p className="chapter-error-title">
              This chapter couldn&apos;t be loaded.
            </p>
            <p className="chapter-error-text">
              The text service may be temporarily unavailable.
            </p>
            <a
              className="chapter-error-link"
              href={sefariaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open it on Sefaria <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </article>

      <nav
        className={`book-pager chapter-pager${
          book.chapters === 1 ? " chapter-pager-single" : ""
        }`}
        aria-label="Chapter navigation"
      >
        <Link
          href={
            previousChapter
              ? `/library/${book.slug}/${previousChapter}`
              : `/library/${book.slug}`
          }
          className="book-pager-link book-pager-prev"
        >
          <span className="book-pager-dir" aria-hidden="true">
            ←
          </span>
          <span className="book-pager-text">
            <small>
              {previousChapter ? "Previous chapter" : "Book contents"}
            </small>
            <strong>
              {previousChapter
                ? `Chapter ${previousChapter}`
                : "All chapters"}
            </strong>
          </span>
        </Link>

        {book.chapters > 1 && (
          <Link
            href={
              nextChapter
                ? `/library/${book.slug}/${nextChapter}`
                : `/library/${book.slug}`
            }
            className="book-pager-link book-pager-next"
          >
            <span className="book-pager-text">
              <small>{nextChapter ? "Next chapter" : "Book contents"}</small>
              <strong>
                {nextChapter ? `Chapter ${nextChapter}` : "All chapters"}
              </strong>
            </span>
            <span className="book-pager-dir" aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </nav>

      <footer className="chapter-foot">
        <a className="chapter-top-link" href="#top">
          ↑ Back to top
        </a>
        <p className="chapter-source">
          Hebrew text from{" "}
          <a href={sefariaUrl} target="_blank" rel="noopener noreferrer">
            Sefaria <span aria-hidden="true">↗</span>
          </a>
        </p>
      </footer>
    </div>
  );
}
