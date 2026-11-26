"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";

import {
  POPULAR_TAGS,
  type Question,
} from "@/app/data/qa-data";
import { postQuestion, voteForQuestion } from "@/app/data/qa-actions";
import {
  getQaSnapshot,
  getServerQaSnapshot,
  subscribeQaStore,
} from "@/app/data/qa-store";
import AskQuestionDialog, { type QuestionDraft } from "./AskQuestionDialog";
import QuestionCard from "./QuestionCard";

function matchesQuery(question: Question, query: string) {
  return (
    question.title.toLowerCase().includes(query) ||
    question.excerpt.toLowerCase().includes(query) ||
    question.tags.some((tag) => tag.toLowerCase().includes(query))
  );
}

export default function QAPage() {
  const snapshot = useSyncExternalStore(
    subscribeQaStore,
    getQaSnapshot,
    getServerQaSnapshot,
  );
  const questions = snapshot.questions;
  const voted = useMemo(() => new Set(snapshot.voted), [snapshot.voted]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState<"votes" | "newest">("votes");
  const [isAskOpen, setIsAskOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const visibleQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return questions
      .filter(
        (question) =>
          activeTag === "All" || question.tags.includes(activeTag),
      )
      .filter(
        (question) => !query || matchesQuery(question, query),
      )
      .sort((a, b) =>
        sortBy === "votes"
          ? b.votes - a.votes
          : b.createdAtTs - a.createdAtTs,
      );
  }, [questions, searchQuery, activeTag, sortBy]);

  const stats = useMemo(
    () => ({
      questions: questions.length,
      answers: questions.reduce(
        (total, question) => total + question.answers,
        0,
      ),
      resolved: questions.filter((question) => question.isResolved).length,
    }),
    [questions],
  );

  const hasFilters = searchQuery.trim() !== "" || activeTag !== "All";

  function resetFilters() {
    setSearchQuery("");
    setActiveTag("All");
  }

  function clearSearch() {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  function handleVote(id: string) {
    if (voted.has(id)) return;
    voteForQuestion(id);
  }

  function handlePost(draft: QuestionDraft) {
    postQuestion(draft);
    setIsAskOpen(false);
  }

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
              <strong>{stats.questions}</strong>
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
            onClick={() => setIsAskOpen(true)}
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
            onChange={(event) => setSearchQuery(event.target.value)}
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
          <strong>{visibleQuestions.length}</strong>{" "}
          {visibleQuestions.length === 1 ? "question" : "questions"}
          {activeTag !== "All" && (
            <>
              {" "}
              in <span className="qa-results-tag">{activeTag}</span>
            </>
          )}
          {searchQuery.trim() && (
            <>
              {" "}
              matching{" "}
              <span className="qa-results-query">
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

      <div className="qa-list" id="qa-question-list">
        {visibleQuestions.length === 0 ? (
          <div className="card qa-empty">
            <span className="qa-empty-icon" aria-hidden="true">
              <FiSearch />
            </span>
            <h2>No questions found</h2>
            <p className="muted">
              Try a different search term or choose another topic.
            </p>
            {hasFilters && (
              <button
                type="button"
                className="btn qa-empty-reset"
                onClick={resetFilters}
              >
                Show all questions
              </button>
            )}
          </div>
        ) : (
          visibleQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              voted={voted.has(question.id)}
              onVote={handleVote}
            />
          ))
        )}
      </div>

      {isAskOpen && (
        <AskQuestionDialog
          onClose={() => setIsAskOpen(false)}
          onPost={handlePost}
        />
      )}
    </div>
  );
}
