export interface Question {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  avatar: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  createdAtTs: number;
  isResolved: boolean;
}

export interface Answer {
  id: string;
  author: string;
  body: string;
  createdAtTs: number;
}

const SEED_NOW = Date.UTC(2026, 10, 11, 6, 0, 0);
const minutesAgo = (minutes: number) => SEED_NOW - minutes * 60_000;

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: "1",
    title: "Why does the Torah repeat the Mishkan details in Vayakhel?",
    excerpt:
      "Terumah and Vayakhel describe the same items almost word for word. What's the purpose of the repetition?",
    author: "Yitzchak G.",
    avatar: "YG",
    votes: 22,
    answers: 2,
    views: 340,
    tags: ["Torah", "Parasha"],
    createdAtTs: minutesAgo(26 * 60),
    isResolved: true,
  },
  {
    id: "2",
    title: "What is the difference between korban olah and korban chatat?",
    excerpt:
      "Trying to understand why some offerings are fully burned while others are eaten by the kohanim...",
    author: "David L.",
    avatar: "DL",
    votes: 14,
    answers: 1,
    views: 120,
    tags: ["Torah", "Vayikra"],
    createdAtTs: minutesAgo(6 * 60),
    isResolved: true,
  },
  {
    id: "3",
    title: "Best commentary for beginners on Psalms?",
    excerpt:
      "Looking for something accessible in English that explains the historical context of each mizmor...",
    author: "Sarah C.",
    avatar: "SC",
    votes: 8,
    answers: 0,
    views: 95,
    tags: ["Tehillim", "Study"],
    createdAtTs: minutesAgo(2 * 60),
    isResolved: false,
  },
  {
    id: "4",
    title: "How do you remember the order of the Torah portions?",
    excerpt:
      "There are 54 parashiyot and I keep mixing up the order in the middle of Bereshit...",
    author: "Miriam K.",
    avatar: "MK",
    votes: 5,
    answers: 1,
    views: 61,
    tags: ["Torah", "Study"],
    createdAtTs: minutesAgo(40),
    isResolved: false,
  },
];

export const POPULAR_TAGS = [
  "All",
  "Torah",
  "Parasha",
  "Tehillim",
  "Halacha",
  "Hebrew",
  "Study",
];

const STORAGE_QUESTIONS = "n-menashe:qa";
const STORAGE_VOTED = "n-menashe:qa-voted";
const STORAGE_ANSWERS = "n-menashe:qa-answers";

function readStoredQuestions(): Question[] {
  if (typeof window === "undefined") return INITIAL_QUESTIONS;

  try {
    const raw = window.localStorage.getItem(STORAGE_QUESTIONS);
    return raw ? (JSON.parse(raw) as Question[]) : INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function loadQuestions(answers = loadAnswers()): Question[] {
  return readStoredQuestions().map((question) => ({
    ...question,
    tags: question.tags ?? [],
    answers: answers[question.id]?.length ?? 0,
    views: question.views ?? 0,
  }));
}

export function saveQuestions(questions: Question[]): void {
  try {
    window.localStorage.setItem(STORAGE_QUESTIONS, JSON.stringify(questions));
  } catch {
    // Storage is unavailable in private mode.
  }
}

export function loadVoted(): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(STORAGE_VOTED);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveVoted(voted: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_VOTED, JSON.stringify([...voted]));
  } catch {
    // Storage is unavailable in private mode.
  }
}

export type AnswersStore = Record<string, Answer[]>;

export const INITIAL_ANSWERS: AnswersStore = {
  "1": [
    {
      id: "seed-1-a",
      author: "Rabbi A. Levi",
      body: "Terumah records the command and Vayakhel records the execution. The repetition celebrates that the work was actually completed exactly as instructed — the second telling is the satisfaction of the first.",
      createdAtTs: minutesAgo(24 * 60),
    },
    {
      id: "seed-1-b",
      author: "Chana S.",
      body: "The midrash compares it to a bride and groom: the command is the engagement, the execution is the wedding. The Torah repeats the details because the fulfillment deserves its own telling.",
      createdAtTs: minutesAgo(20 * 60),
    },
  ],
  "2": [
    {
      id: "seed-2-a",
      author: "David L.",
      body: "An olah is entirely consumed on the altar, while a chatat is eaten by the kohanim in the courtyard. The olah expresses complete dedication; the chatat addresses an inadvertent sin and is partly shared.",
      createdAtTs: minutesAgo(4 * 60),
    },
  ],
  "3": [],
  "4": [
    {
      id: "seed-4-a",
      author: "Miriam K.",
      body: "I learned them by pairing each parasha with its opening scene. The middle of Bereshit is easier once you anchor Vayera, Chayei Sarah, and Toldot to their stories.",
      createdAtTs: minutesAgo(30),
    },
  ],
};

function cloneAnswers(store: AnswersStore): AnswersStore {
  return Object.fromEntries(
    Object.entries(store).map(([id, answers]) => [id, [...answers]]),
  );
}

export function loadAnswers(): AnswersStore {
  if (typeof window === "undefined") return cloneAnswers(INITIAL_ANSWERS);

  try {
    const raw = window.localStorage.getItem(STORAGE_ANSWERS);
    if (!raw) return cloneAnswers(INITIAL_ANSWERS);

    return cloneAnswers({
      ...INITIAL_ANSWERS,
      ...(JSON.parse(raw) as AnswersStore),
    });
  } catch {
    return cloneAnswers(INITIAL_ANSWERS);
  }
}

export function saveAnswers(store: AnswersStore): void {
  try {
    window.localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(store));
  } catch {
    // Storage is unavailable in private mode.
  }
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relTime(timestamp: number): string {
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return RELATIVE_TIME.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (hours < 24) return RELATIVE_TIME.format(-hours, "hour");

  return RELATIVE_TIME.format(-Math.round(hours / 24), "day");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
