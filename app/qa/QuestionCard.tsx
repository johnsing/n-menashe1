import Link from "next/link";
import { FiCheckCircle, FiEye, FiMessageSquare } from "react-icons/fi";

import { relTime, type Question } from "@/app/data/qa-data";
import VoteButton from "./VoteButton";

interface QuestionCardProps {
  question: Question;
  voted: boolean;
  onVote: (id: string) => void;
}

export default function QuestionCard({
  question,
  voted,
  onVote,
}: QuestionCardProps) {
  return (
    <article className="card qa-card" id={`question-${question.id}`}>
      <VoteButton
        votes={question.votes}
        voted={voted}
        onVote={() => onVote(question.id)}
      />

      <Link href={`/qa/${question.id}`} className="qa-card-body">
        <h2 className="qa-card-title">
          <span className="qa-card-title-text">{question.title}</span>
          {question.isResolved && (
            <span className="qa-resolved">
              <FiCheckCircle aria-hidden="true" /> Resolved
            </span>
          )}
        </h2>

        <p className="qa-card-excerpt">{question.excerpt}</p>

        {question.tags.length > 0 && (
          <div className="qa-card-tags">
            {question.tags.map((tag) => (
              <span key={tag} className="qa-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="qa-card-meta">
          <span className="qa-avatar" aria-hidden="true">
            {question.avatar}
          </span>
          <span className="qa-byline" suppressHydrationWarning>
            {question.author} · {relTime(question.createdAtTs)}
          </span>
          <span className="qa-stat">
            <FiMessageSquare aria-hidden="true" />
            {question.answers}
            <span className="qa-sr-only">
              {" "}
              {question.answers === 1 ? "answer" : "answers"}
            </span>
          </span>
          <span className="qa-stat">
            <FiEye aria-hidden="true" />
            {question.views}
            <span className="qa-sr-only"> views</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
