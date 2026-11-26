import {
  initials,
  loadAnswers,
  loadQuestions,
  loadVoted,
  saveAnswers,
  saveQuestions,
  saveVoted,
  type Answer,
  type Question,
} from "./qa-data";
import { publishQaChange } from "./qa-store";

export interface NewQuestion {
  title: string;
  excerpt: string;
  author: string;
  tags: string[];
}

function updateQuestion(
  id: string,
  update: (question: Question) => Question,
) {
  saveQuestions(
    loadQuestions().map((question) =>
      question.id === id ? update(question) : question,
    ),
  );
}

export function voteForQuestion(id: string): boolean {
  const voted = loadVoted();
  if (voted.has(id)) return false;

  saveVoted(voted.add(id));
  updateQuestion(id, (question) => ({
    ...question,
    votes: question.votes + 1,
  }));
  publishQaChange();
  return true;
}

export function recordQuestionView(id: string): void {
  updateQuestion(id, (question) => ({
    ...question,
    views: question.views + 1,
  }));
  publishQaChange();
}

export function postQuestion(draft: NewQuestion): Question {
  const createdAt = Date.now();
  const question: Question = {
    id: createdAt.toString(),
    ...draft,
    avatar: initials(draft.author),
    votes: 0,
    answers: 0,
    views: 1,
    createdAtTs: createdAt,
    isResolved: false,
  };

  saveQuestions([question, ...loadQuestions()]);
  publishQaChange();
  return question;
}

export function postAnswer(
  questionId: string,
  author: string,
  body: string,
): void {
  const trimmedBody = body.trim();
  if (!trimmedBody) return;

  const createdAt = Date.now();
  const answer: Answer = {
    id: createdAt.toString(),
    author: author.trim() || "Anonymous",
    body: trimmedBody,
    createdAtTs: createdAt,
  };

  const answers = loadAnswers();
  const updatedAnswers = [...(answers[questionId] ?? []), answer];

  saveAnswers({ ...answers, [questionId]: updatedAnswers });
  updateQuestion(questionId, (question) => ({
    ...question,
    answers: updatedAnswers.length,
  }));
  publishQaChange();
}
