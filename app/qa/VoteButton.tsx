import { FiArrowUp } from "react-icons/fi";

interface VoteButtonProps {
  votes: number;
  voted: boolean;
  onVote: () => void;
}

export default function VoteButton({
  votes,
  voted,
  onVote,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      className={`qa-vote${voted ? " voted" : ""}`}
      onClick={onVote}
      disabled={voted}
      aria-pressed={voted}
      title={voted ? "You already voted" : "Upvote"}
    >
      <FiArrowUp aria-hidden="true" />
      <span className="qa-vote-count">{votes}</span>
      <span className="qa-vote-label">Votes</span>
      <span className="qa-sr-only">
        {voted ? "Already upvoted" : "Upvote this question"}
      </span>
    </button>
  );
}
