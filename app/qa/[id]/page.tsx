"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";

import { initials, relTime } from "@/app/data/qa-data";
import {
  postAnswer,
  recordQuestionView,
  voteForQuestion,
} from "@/app/data/qa-actions";
import {
  getQaSnapshot,
  subscribeQaStore,
  type QaSnapshot,
} from "@/app/data/qa-store";
import VoteButton from "../VoteButton";

const getUnavailableSnapshot = () => null;

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const snapshot = useSyncExternalStore<QaSnapshot | null>(
    subscribeQaStore,
    getQaSnapshot,
    getUnavailableSnapshot,
  );

  const question =
    snapshot?.questions.find((entry) => entry.id === id) ?? null;
  const answers = snapshot?.answers[id] ?? [];
  const isVoted = snapshot?.voted.includes(id) ?? false;

  const [answerAuthor, setAnswerAuthor] = useState("");
  const [answerBody, setAnswerBody] = useState("");
  const viewedQuestionId = useRef<string | null>(null);

  useEffect(() => {
    if (!question || viewedQuestionId.current === id) return;
    viewedQuestionId.current = id;
    recordQuestionView(id);
  }, [id, question]);

  function handleVote() {
    if (!question || isVoted) return;
    voteForQuestion(question.id);
  }

  function handleSubmitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question || !answerBody.trim()) return;

    postAnswer(question.id, answerAuthor, answerBody);
    setAnswerAuthor("");
    setAnswerBody("");
  }

  if (!snapshot) {
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

  if (!question) {
    return (
      <div className="container qa qa-page qa-detail" lang="en" dir="ltr">
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
            It may have been asked in a different browser, or its saved data
            was cleared.
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

      <article className="card qa-card qa-detail-q">
        <VoteButton
          votes={question.votes}
          voted={isVoted}
          onVote={handleVote}
        />

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
              {question.tags.map((tag) => (
                <span key={tag} className="qa-chip">
                  {tag}
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
            {answers.map((answer) => (
              <article key={answer.id} className="card qa-answer">
                <span
                  className="qa-avatar qa-answer-avatar"
                  aria-hidden="true"
                >
                  {initials(answer.author)}
                </span>
                <div className="qa-answer-body">
                  <div className="qa-answer-meta">
                    <strong>{answer.author}</strong>
                    <span className="muted" suppressHydrationWarning>
                      · {relTime(answer.createdAtTs)}
                    </span>
                  </div>
                  <p className="qa-answer-text">{answer.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}

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
              onChange={(event) => setAnswerAuthor(event.target.value)}
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
              onChange={(event) => setAnswerBody(event.target.value)}
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
