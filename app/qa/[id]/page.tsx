// app/qa/[id]/page.tsx — Question detail with answers thread
"use client";

import { use, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowUp,
  FiCheckCircle,
  FiEye,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";

import {
  loadQuestions,
  saveQuestions,
  loadVoted,
  saveVoted,
  loadAnswers,
  saveAnswers,
  relTime,
  initials,
  type Question,
  type Answer,
} from "@/app/data/qa-data";

type QaSnapshot = {
  questions: Question[];
  answers: Record<string, Answer[]>;
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

function getQaSnapshot(): string {
  return JSON.stringify({
    questions: loadQuestions(),
    answers: loadAnswers(),
    voted: [...loadVoted()],
  });
}

function publishQaChange() {
  window.dispatchEvent(new Event(QA_STORAGE_CHANGE));
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const snapshot = useSyncExternalStore(
    subscribeToQaStorage,
    getQaSnapshot,
    () => null,
  );
  const data: QaSnapshot | null = snapshot ? JSON.parse(snapshot) : null;
  const question = data?.questions.find((item) => item.id === id) ?? null;
  const answers = data?.answers[id] ?? [];
  const voted = new Set(data?.voted ?? []);
  const notFound = data !== null && question === null;
  const viewedQuestionId = useRef<string | null>(null);

  const [answerAuthor, setAnswerAuthor] = useState("");
  const [answerBody, setAnswerBody] = useState("");

  // Load data + bump the view count (browser only)
  useEffect(() => {
    if (!question || viewedQuestionId.current === id) return;
    viewedQuestionId.current = id;

    // increment views once per visit
    const updated = loadQuestions().map((item) =>
      item.id === id ? { ...item, views: item.views + 1 } : item,
    );
    saveQuestions(updated);
    publishQaChange();
  }, [id, question]);

  const handleVote = () => {
    if (!question || voted.has(question.id)) return;
    const next = new Set(voted).add(question.id);
    saveVoted(next);

    const questions = loadQuestions().map((x) =>
      x.id === question.id ? { ...x, votes: x.votes + 1 } : x,
    );
    saveQuestions(questions);
    publishQaChange();
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answerBody.trim()) return;

    const author = answerAuthor.trim() || "Anonymous";
    const answer: Answer = {
      id: Date.now().toString(),
      author,
      body: answerBody.trim(),
      createdAtTs: Date.now(),
    };

    const store = loadAnswers();
    const list = [...(store[question.id] ?? []), answer];
    store[question.id] = list;
    saveAnswers(store);

    // keep the denormalized count in sync
    const questions = loadQuestions().map((x) =>
      x.id === question.id ? { ...x, answers: list.length } : x,
    );
    saveQuestions(questions);
    publishQaChange();

    setAnswerAuthor("");
    setAnswerBody("");
  };

  // Server render / loading state
  if (!data) {
    return (
      <div
        className="container qa qa-page qa-detail"
        aria-busy="true"
        lang="en"
        dir="ltr"
      >
        <div className="card qa-empty qa-detail-loading" role="status">
          <span className="qa-empty-icon" aria-hidden="true">
            <FiMessageSquare />
          </span>
          <p className="muted">Loading question…</p>
        </div>
      </div>
    );
  }

  if (notFound || !question) {
    return (
      <div
        className="container qa qa-page qa-detail"
        lang="en"
        dir="ltr"
      >
        <nav className="qa-detail-nav" aria-label="Breadcrumb">
          <Link href="/qa" className="qa-detail-back">
            <FiArrowLeft aria-hidden="true" />
            Back to Q&amp;A
          </Link>
        </nav>

        <div className="card qa-empty">
          <span className="qa-empty-icon" aria-hidden="true">
            <FiMessageSquare />
          </span>
          <h1>Question not found</h1>
          <p className="muted">
            It may have been asked in a different browser, or its saved data was
            cleared.
          </p>
          <Link href="/qa" className="btn qa-empty-reset">
            Back to all questions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container qa qa-page qa-detail" lang="en" dir="ltr">
      <nav className="qa-detail-nav" aria-label="Breadcrumb">
        <Link href="/qa" className="qa-detail-back">
          <FiArrowLeft aria-hidden="true" />
          Back to Q&amp;A
        </Link>
      </nav>

      {/* The question */}
      <article className="card qa-card qa-detail-q">
        <button
          type="button"
          className={`qa-vote${voted.has(question.id) ? " voted" : ""}`}
          onClick={handleVote}
          disabled={voted.has(question.id)}
          aria-pressed={voted.has(question.id)}
          title={voted.has(question.id) ? "You already voted" : "Upvote"}
        >
          <FiArrowUp aria-hidden="true" />
          <span className="qa-vote-count">{question.votes}</span>
          <span className="qa-vote-label">Votes</span>
          <span className="qa-sr-only">
            {voted.has(question.id)
              ? "Already upvoted"
              : "Upvote this question"}
          </span>
        </button>

        <div className="qa-card-body qa-detail-body">
          <div className="qa-detail-flags">
            <span className="qa-kicker">Question</span>
            {question.isResolved && (
              <span className="qa-resolved">
                <FiCheckCircle aria-hidden="true" /> Resolved
              </span>
            )}
          </div>

          <h1 className="qa-detail-title">{question.title}</h1>
          <p className="qa-card-excerpt qa-detail-excerpt">
            {question.excerpt}
          </p>

          {question.tags.length > 0 && (
            <div className="qa-card-tags">
              {question.tags.map((t) => (
                <span key={t} className="qa-chip">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="qa-card-meta qa-detail-meta">
            <span className="qa-avatar" aria-hidden="true">
              {question.avatar}
            </span>
            <span className="qa-byline" suppressHydrationWarning>
              {question.author} · {relTime(question.createdAtTs)}
            </span>
            <span className="qa-stat">
              <FiEye aria-hidden="true" />
              {question.views}
              <span className="qa-sr-only"> views</span>
            </span>
            <span className="qa-stat">
              <FiMessageSquare aria-hidden="true" />
              {answers.length}
              <span className="qa-sr-only">
                {" "}
                {answers.length === 1 ? "answer" : "answers"}
              </span>
            </span>
          </div>
        </div>
      </article>

      {/* Answers */}
      <section className="qa-answers" aria-labelledby="qa-answers-title">
        <header className="qa-answers-head">
          <div>
            <p className="qa-kicker">Discussion</p>
            <h2 id="qa-answers-title" className="qa-answers-title">
              {answers.length === 0
                ? "No Answers Yet"
                : `${answers.length} ${
                    answers.length === 1 ? "Answer" : "Answers"
                  }`}
            </h2>
          </div>
          <p className="qa-answers-note" aria-live="polite">
            {answers.length === 0
              ? "Be the first to respond"
              : "Community responses"}
          </p>
        </header>

        {answers.length === 0 ? (
          <div className="card qa-empty qa-answers-empty">
            <span className="qa-empty-icon" aria-hidden="true">
              <FiMessageSquare />
            </span>
            <h3>Start the conversation</h3>
            <p className="muted">
              Share a source, an explanation, or your experience below.
            </p>
          </div>
        ) : (
          <div className="qa-answers-list">
            {answers.map((a) => (
              <article key={a.id} className="card qa-answer">
                <span className="qa-avatar qa-answer-avatar" aria-hidden="true">
                  {initials(a.author)}
                </span>
                <div className="qa-answer-body">
                  <div className="qa-answer-meta">
                    <strong>{a.author}</strong>
                    <span className="muted" suppressHydrationWarning>
                      · {relTime(a.createdAtTs)}
                    </span>
                  </div>
                  <p className="qa-answer-text">{a.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Answer form */}
        <form
          onSubmit={handleSubmitAnswer}
          className="qa-form qa-answer-form"
          aria-labelledby="qa-answer-form-title"
        >
          <div className="qa-answer-form-head">
            <p className="qa-kicker">Join the discussion</p>
            <h3 id="qa-answer-form-title">Your Answer</h3>
            <p className="qa-answer-form-note">
              Answers stay in this browser.
            </p>
          </div>

          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-answer-author">
              Your name <span className="qa-optional">Optional</span>
            </label>
            <input
              id="qa-answer-author"
              className="input"
              type="text"
              placeholder="e.g. David L."
              value={answerAuthor}
              onChange={(e) => setAnswerAuthor(e.target.value)}
              autoComplete="name"
              maxLength={80}
            />
          </div>

          <div className="qa-field">
            <label className="qa-label" htmlFor="qa-answer-body">
              Your answer <span className="qa-required">Required</span>
            </label>
            <textarea
              id="qa-answer-body"
              className="input qa-textarea"
              rows={5}
              required
              maxLength={2000}
              placeholder="Share sources, explanations, or your experience…"
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
            />
          </div>

          <div className="qa-form-actions">
            <button type="submit" className="btn qa-submit">
              <FiSend aria-hidden="true" />
              Post Answer
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
