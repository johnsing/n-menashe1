// app/qa/page.tsx — Community Q&A feed (list)
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiArrowUp,
  FiArrowUpCircle,
  FiEye,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import "@/app/qa/qa.css";
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

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>(loadQuestions);
  const [voted, setVoted] = useState<Set<string>>(loadVoted);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  // ── persistence ────────────────────────────────────────────
  useEffect(() => {
    saveQuestions(questions);
  }, [questions]);

  useEffect(() => {
    saveVoted(voted);
  }, [voted]);

  // ── modal: Escape to close + body scroll lock ───────────────
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const filtered = useMemo(() => {
    return questions
      .filter((q) => activeTag === "All" || q.tags.includes(activeTag))
      .filter(
        (q) =>
          q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
      .sort((a, b) =>
        sortBy === "votes" ? b.votes - a.votes : b.createdAtTs - a.createdAtTs,
      );
  }, [questions, searchQuery, activeTag, sortBy]);

  const handleVote = (id: string) => {
    if (voted.has(id)) return; // one vote per question, per browser
    setVoted(new Set(voted).add(id));
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q)),
    );
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newExcerpt.trim()) return;
    const author = newAuthor.trim() || "Anonymous";
    const question: Question = {
      id: Date.now().toString(),
      title: newTitle,
      excerpt: newExcerpt,
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

    setQuestions((prev) => [question, ...prev]);
    setNewTitle("");
    setNewExcerpt("");
    setNewTags("");
    setNewAuthor("");
    setIsModalOpen(false);
  };

  return (
    <main className="container qa">
      {/* Header */}
      <div className="qa-header">
        <div>
          <p className="muted">
            <Link href="/">← Back to Home</Link>
          </p>
          <h1>Q&A Community</h1>
        </div>
        <button className="btn qa-ask" onClick={() => setIsModalOpen(true)}>
          <FiPlus aria-hidden="true" /> Ask Question
        </button>
      </div>

      {/* Search */}
      <div className="qa-search">
        <FiSearch className="qa-search-icon" aria-hidden="true" />
        <input
          className="input"
          type="text"
          placeholder="Search questions, topics, tags…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="qa-filters">
        <div className="qa-tags">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              className={`qa-tag${activeTag === tag ? " active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="qa-sort" role="group" aria-label="Sort questions">
          <button
            className={`qa-sort-btn${sortBy === "votes" ? " active" : ""}`}
            onClick={() => setSortBy("votes")}
          >
            Top Voted
          </button>
          <button
            className={`qa-sort-btn${sortBy === "newest" ? " active" : ""}`}
            onClick={() => setSortBy("newest")}
          >
            Newest First
          </button>
        </div>
      </div>

      {/* Question list */}
      <div className="qa-list">
        {filtered.length === 0 ? (
          <div className="card qa-empty">
            <p className="muted">No questions match your search.</p>
          </div>
        ) : (
          filtered.map((q) => (
            <article key={q.id} className="card qa-card" id={`question-${q.id}`}>
              {/* Voting */}
              <button
                className={`qa-vote${voted.has(q.id) ? " voted" : ""}`}
                onClick={() => handleVote(q.id)}
                disabled={voted.has(q.id)}
                aria-label={`Upvote (current: ${q.votes} votes)`}
                title={voted.has(q.id) ? "You already voted" : "Upvote"}
              >
                <FiArrowUp aria-hidden="true" />
                <span>{q.votes}</span>
              </button>

              {/* Body — clicking opens the Q&A detail page */}
              <Link href={`/qa/${q.id}`} className="qa-card-body">
                <h3 className="qa-card-title">
                  {q.title}
                  {q.isResolved && (
                    <span className="qa-resolved">
                      <FiCheckCircle aria-hidden="true" /> Resolved
                    </span>
                  )}
                </h3>
                <p className="qa-card-excerpt">{q.excerpt}</p>

                <div className="qa-card-tags">
                  {q.tags.map((t) => (
                    <span key={t} className="qa-chip">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="qa-card-meta">
                  <span className="qa-avatar" aria-hidden="true">
                    {q.avatar}
                  </span>
                  <span>
                    {q.author} · {relTime(q.createdAtTs)}
                  </span>
                  <span className="qa-stat">
                    <FiMessageSquare aria-hidden="true" /> {q.answers}
                  </span>
                  <span className="qa-stat">
                    <FiEye aria-hidden="true" /> {q.views}
                  </span>
                </div>
              </Link>
            </article>
          ))
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
            className="qa-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qa-modal-title"
          >
            <div className="qa-modal-head">
              <h2 id="qa-modal-title">Ask a Question</h2>
              <button
                className="qa-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="qa-form">
              <label className="qa-label">
                Your name (optional)
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. David L."
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                />
              </label>

              <label className="qa-label">
                Question title *
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. What does 'chesed' mean in Genesis 24?"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </label>

              <label className="qa-label">
                Details *
                <textarea
                  className="input qa-textarea"
                  placeholder="Give some context — sources, what you've read, where you're stuck…"
                  required
                  rows={4}
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                />
              </label>

              <label className="qa-label">
                Tags (comma separated)
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Torah, Parasha"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </label>

              <button type="submit" className="btn qa-submit">
                <FiArrowUpCircle aria-hidden="true" /> Post Question
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// Re-export so older imports don't break
export { INITIAL_QUESTIONS };
