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
import "@/app/qa/qa.css";
import "@/app/qa/qa-extras.css";

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
      <main className="container qa">
        <p className="muted">Loading…</p>
      </main>
    );
  }

  if (notFound || !question) {
    return (
      <main className="container qa">
        <p className="muted">
          <Link href="/qa">
            <FiArrowLeft aria-hidden="true" /> Back to Q&A
          </Link>
        </p>
        <div className="card qa-empty">
          <h2>Question not found</h2>
          <p className="muted">
            It may have been asked on a different browser or cleared data.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container qa qa-detail">
      <p className="muted">
        <Link href="/qa">
          <FiArrowLeft aria-hidden="true" /> Back to Q&A
        </Link>
      </p>

      {/* The question */}
      <article className="card qa-card qa-detail-q">
        <button
          className={`qa-vote${voted.has(question.id) ? " voted" : ""}`}
          onClick={handleVote}
          disabled={voted.has(question.id)}
          aria-label={`Upvote (current: ${question.votes} votes)`}
          title={voted.has(question.id) ? "You already voted" : "Upvote"}
        >
          <FiArrowUp aria-hidden="true" />
          <span>{question.votes}</span>
        </button>

        <div className="qa-card-body">
          <h1 className="qa-detail-title">
            {question.title}
            {question.isResolved && (
              <span className="qa-resolved">
                <FiCheckCircle aria-hidden="true" /> Resolved
              </span>
            )}
          </h1>
          <p className="qa-card-excerpt">{question.excerpt}</p>

          <div className="qa-card-tags">
            {question.tags.map((t) => (
              <span key={t} className="qa-chip">
                {t}
              </span>
            ))}
          </div>

          <div className="qa-card-meta">
            <span className="qa-avatar" aria-hidden="true">
              {question.avatar}
            </span>
            <span>
              {question.author} · {relTime(question.createdAtTs)}
            </span>
            <span className="qa-stat">
              <FiEye aria-hidden="true" /> {question.views}
            </span>
          </div>
        </div>
      </article>

      {/* Answers */}
      <section className="qa-answers">
        <h2 className="qa-answers-title">
          <FiMessageSquare aria-hidden="true" /> {answers.length}{" "}
          {answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {answers.length === 0 ? (
          <div className="card qa-empty">
            <p className="muted">No answers yet — be the first to share.</p>
          </div>
        ) : (
          <div className="qa-answers-list">
            {answers.map((a) => (
              <article key={a.id} className="card qa-answer">
                <span className="qa-avatar" aria-hidden="true">
                  {initials(a.author)}
                </span>
                <div className="qa-answer-body">
                  <div className="qa-answer-meta">
                    <strong>{a.author}</strong>
                    <span className="muted"> · {relTime(a.createdAtTs)}</span>
                  </div>
                  <p className="qa-answer-text">{a.body}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Answer form */}
        <form onSubmit={handleSubmitAnswer} className="qa-form qa-answer-form">
          <h3>Your Answer</h3>
          <input
            className="input"
            type="text"
            placeholder="Your name (optional)"
            value={answerAuthor}
            onChange={(e) => setAnswerAuthor(e.target.value)}
          />
          <textarea
            className="input qa-textarea"
            rows={4}
            required
            placeholder="Share sources, explanations, or your experience…"
            value={answerBody}
            onChange={(e) => setAnswerBody(e.target.value)}
          />
          <button type="submit" className="btn qa-submit">
            <FiSend aria-hidden="true" /> Post Answer
          </button>
        </form>
      </section>
    </main>
  );
}
