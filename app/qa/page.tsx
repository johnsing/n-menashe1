// app/qa/page.tsx — Community Q&A feed (list)
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  FiArrowUp,
  FiArrowUpCircle,
  FiCheckCircle,
  FiEye,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiX,
} from "react-icons/fi";

import {
  INITIAL_QUESTIONS,
  POPULAR_TAGS,
  loadQuestions,
  saveQuestions,
  loadVoted,
  saveVoted,
  relTime,
  initials,
  type Question,
} from "@/app/data/qa-data";

type QaListSnapshot = {
  questions: Question[];
  voted: string[];
};

const QA_STORAGE_CHANGE = "qa-storage-change";

function subscribeToQaStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(QA_STORAGE_CHANGE, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(QA_STORAGE_CHANGE, onStoreChange);
  };
}

// useSyncExternalStore requires a stable snapshot reference between reads.
let cachedSnapshotKey = "";
let cachedSnapshot: QaListSnapshot = {
  questions: INITIAL_QUESTIONS,
  voted: [],
};

function getQaListSnapshot(): QaListSnapshot {
  const questions = loadQuestions();
  const voted = [...loadVoted()];
  const key = JSON.stringify({ questions, voted });
  if (key !== cachedSnapshotKey) {
    cachedSnapshotKey = key;
    cachedSnapshot = { questions, voted };
  }
  return cachedSnapshot;
}

// Hydration uses the same seed data that was prerendered, then swaps to
// localStorage data once React starts listening to the store.
const SERVER_SNAPSHOT: QaListSnapshot = {
  questions: INITIAL_QUESTIONS,
  voted: [],
};
const getServerQaListSnapshot = () => SERVER_SNAPSHOT;

function publishQaChange() {
  window.dispatchEvent(new Event(QA_STORAGE_CHANGE));
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function QAPage() {
  const snapshot = useSyncExternalStore(
    subscribeToQaStorage,
    getQaListSnapshot,
    getServerQaListSnapshot,
  );
  const questions = snapshot.questions;
  const voted = useMemo(() => new Set(snapshot.voted), [snapshot.voted]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // ── modal: Escape, scroll lock, focus trap, focus restore ──
  useEffect(() => {
    if (!isModalOpen) return;

    const dialog = modalRef.current;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    // The dialog doesn't have a native autofocus target, so move focus to
    // the first real field after the sheet has painted.
    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.getClientRects().length > 0);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      const restoreTarget = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (restoreTarget) {
        window.setTimeout(() => restoreTarget.focus(), 0);
      }
    };
  }, [isModalOpen]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return questions
      .filter((q) => activeTag === "All" || q.tags.includes(activeTag))
      .filter(
        (q) =>
          !query ||
          q.title.toLowerCase().includes(query) ||
          q.excerpt.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query)),
      )
      .sort((a, b) =>
        sortBy === "votes" ? b.votes - a.votes : b.createdAtTs - a.createdAtTs,
      );
  }, [questions, searchQuery, activeTag, sortBy]);

  const stats = useMemo(() => {
    const answers = questions.reduce((sum, q) => sum + q.answers, 0);
    const resolved = questions.filter((q) => q.isResolved).length;
    return { total: questions.length, answers, resolved };
  }, [questions]);

  const hasFilters = searchQuery.trim() !== "" || activeTag !== "All";

  const resetFilters = () => {
    setSearchQuery("");
    setActiveTag("All");
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleVote = (id: string) => {
    if (voted.has(id)) return; // one vote per question, per browser
    const nextVoted = new Set(voted).add(id);
    saveVoted(nextVoted);
    saveQuestions(
      questions.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q)),
    );
    publishQaChange();
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;
    const author = newAuthor.trim() || "Anonymous";
    const question: Question = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      excerpt: newExcerpt.trim(),
      author,
      avatar: initials(author),
      votes: 0,
      answers: 0,
      views: 1,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAtTs: Date.now(),
      isResolved: false,
    };

    saveQuestions([question, ...questions]);
    publishQaChange();
    setNewTitle("");
    setNewExcerpt("");
    setNewTags("");
    setNewAuthor("");
    setIsModalOpen(false);
  };

  return (
    <div className="container qa qa-page" lang="en" dir="ltr">
      <header className="qa-hero">
        <div className="qa-hero-copy">
          <p className="qa-kicker">Community study hall</p>
          <p className="qa-back">
            <Link href="/">← Back to Home</Link>
          </p>
          <h1>Q&amp;A Community</h1>
          <p className="qa-hero-sub">
            Ask a question, share what you&apos;ve learned, and study the
            sources together.
          </p>

          <ul className="qa-stats" aria-label="Community activity">
            <li>
              <strong>{stats.total}</strong>
              <span>Questions</span>
            </li>
            <li>
              <strong>{stats.answers}</strong>
              <span>Answers</span>
            </li>
            <li>
              <strong>{stats.resolved}</strong>
              <span>Resolved</span>
            </li>
          </ul>
        </div>

        <div className="qa-hero-actions">
          <button
            type="button"
            className="btn qa-ask"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus aria-hidden="true" />
            Ask Question
          </button>
        </div>
      </header>

      <section className="qa-controls" aria-label="Search and filter questions">
        <div className="qa-search">
          <label className="qa-sr-only" htmlFor="qa-search">
            Search questions
          </label>
          <FiSearch className="qa-search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            id="qa-search"
            className="input"
            type="search"
            placeholder="Search questions, topics, tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-controls="qa-question-list"
          />
          {searchQuery && (
            <button
              type="button"
              className="qa-search-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <FiX aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="qa-filter-row">
          <div className="qa-filter-group">
            <span className="qa-control-label" id="qa-topic-label">
              Topics
            </span>
            <div
              className="qa-tags"
              role="group"
              aria-labelledby="qa-topic-label"
            >
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`qa-tag${activeTag === tag ? " active" : ""}`}
                  onClick={() => setActiveTag(tag)}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="qa-sort-wrap">
            <span className="qa-control-label" id="qa-sort-label">
              Sort
            </span>
            <div
              className="qa-sort"
              role="group"
              aria-labelledby="qa-sort-label"
            >
              <button
                type="button"
                className={`qa-sort-btn${sortBy === "votes" ? " active" : ""}`}
                onClick={() => setSortBy("votes")}
                aria-pressed={sortBy === "votes"}
              >
                Top Voted
              </button>
              <button
                type="button"
                className={`qa-sort-btn${sortBy === "newest" ? " active" : ""}`}
                onClick={() => setSortBy("newest")}
                aria-pressed={sortBy === "newest"}
              >
                Newest First
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="qa-results-bar">
        <p className="qa-results" aria-live="polite">
          <strong>{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "question" : "questions"}
          {activeTag !== "All" && (
            <>
              {" "}
              in <span className="qa-results-tag">{activeTag}</span>
            </>
          )}
          {searchQuery.trim() && (
            <>
              {" "}
              matching <span className="qa-results-query">
                “{searchQuery.trim()}”
              </span>
            </>
          )}
        </p>

        {hasFilters && (
          <button
            type="button"
            className="qa-reset"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Question list */}
      <div className="qa-list" id="qa-question-list">
        {filtered.length === 0 ? (
          <div className="card qa-empty">
            <span className="qa-empty-icon" aria-hidden="true">
              <FiSearch />
            </span>
            <h2>No questions found</h2>
            <p className="muted">
              Try a different search term or choose another topic.
            </p>
            {hasFilters && (
              <button type="button" className="btn qa-empty-reset" onClick={resetFilters}>
                Show all questions
              </button>
            )}
          </div>
        ) : (
          filtered.map((q) => {
            const isVoted = voted.has(q.id);
            return (
              <article
                key={q.id}
                className="card qa-card"
                id={`question-${q.id}`}
              >
                {/* Voting */}
                <button
                  type="button"
                  className={`qa-vote${isVoted ? " voted" : ""}`}
                  onClick={() => handleVote(q.id)}
                  disabled={isVoted}
                  aria-pressed={isVoted}
                  title={isVoted ? "You already voted" : "Upvote"}
                >
                  <FiArrowUp aria-hidden="true" />
                  <span className="qa-vote-count">{q.votes}</span>
                  <span className="qa-vote-label">Votes</span>
                  <span className="qa-sr-only">
                    {isVoted ? "Already upvoted" : "Upvote this question"}
                  </span>
                </button>

                {/* Body — clicking opens the Q&A detail page */}
                <Link href={`/qa/${q.id}`} className="qa-card-body">
                  <h2 className="qa-card-title">
                    <span className="qa-card-title-text">{q.title}</span>
                    {q.isResolved && (
                      <span className="qa-resolved">
                        <FiCheckCircle aria-hidden="true" /> Resolved
                      </span>
                    )}
                  </h2>
                  <p className="qa-card-excerpt">{q.excerpt}</p>

                  {q.tags.length > 0 && (
                    <div className="qa-card-tags">
                      {q.tags.map((t) => (
                        <span key={t} className="qa-chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="qa-card-meta">
                    <span className="qa-avatar" aria-hidden="true">
                      {q.avatar}
                    </span>
                    <span className="qa-byline" suppressHydrationWarning>
                      {q.author} · {relTime(q.createdAtTs)}
                    </span>
                    <span className="qa-stat">
                      <FiMessageSquare aria-hidden="true" />
                      {q.answers}
                      <span className="qa-sr-only">
                        {" "}
                        {q.answers === 1 ? "answer" : "answers"}
                      </span>
                    </span>
                    <span className="qa-stat">
                      <FiEye aria-hidden="true" />
                      {q.views}
                      <span className="qa-sr-only"> views</span>
                    </span>
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </div>

      {/* Ask modal */}
      {isModalOpen && (
        <div
          className="qa-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            ref={modalRef}
            className="qa-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qa-modal-title"
            aria-describedby="qa-modal-desc"
          >
            <div className="qa-modal-head">
              <div>
                <p className="qa-kicker">New question</p>
                <h2 id="qa-modal-title">Ask the Community</h2>
              </div>
              <button
                type="button"
                className="qa-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <p className="qa-modal-desc" id="qa-modal-desc">
              Share enough context for others to learn with you. Questions and
              answers stay in this browser.
            </p>

            <form onSubmit={handleSubmitQuestion} className="qa-form">
              <div className="qa-field">
                <label className="qa-label" htmlFor="qa-author">
                  Your name <span className="qa-optional">Optional</span>
                </label>
                <input
                  id="qa-author"
                  className="input"
                  type="text"
                  placeholder="e.g. David L."
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="qa-field">
                <label className="qa-label" htmlFor="qa-title">
                  Question title <span className="qa-required">Required</span>
                </label>
                <input
                  ref={titleInputRef}
                  id="qa-title"
                  className="input"
                  type="text"
                  placeholder="e.g. What does 'chesed' mean in Genesis 24?"
                  required
                  maxLength={180}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="qa-field">
                <label className="qa-label" htmlFor="qa-details">
                  Details <span className="qa-required">Required</span>
                </label>
                <textarea
                  id="qa-details"
                  className="input qa-textarea"
                  placeholder="Give some context — sources, what you've read, where you're stuck…"
                  required
                  maxLength={2000}
                  rows={5}
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                />
              </div>

              <div className="qa-field">
                <label className="qa-label" htmlFor="qa-tags">
                  Tags <span className="qa-optional">Comma separated</span>
                </label>
                <input
                  id="qa-tags"
                  className="input"
                  type="text"
                  placeholder="e.g. Torah, Parasha"
                  maxLength={120}
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <div className="qa-form-actions">
                <button
                  type="button"
                  className="btn qa-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn qa-submit">
                  <FiArrowUpCircle aria-hidden="true" />
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export so older imports don't break
export { INITIAL_QUESTIONS };
