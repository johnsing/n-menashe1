// app/qa/data.ts — shared Q&A data, storage keys, helpers
// Used by both the list page (app/qa/page.tsx) and the detail
// page (app/qa/[id]/page.tsx) so they read/write the same data.

export interface Question {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  avatar: string;
  votes: number;
  answers: number; // denormalized count (kept in sync with answers store)
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

// Seed timestamps are fixed so the prerendered HTML and the first client
// render agree. Relative times are refreshed after hydration.
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

export const STORAGE_Q = "n-menashe:qa";
export const STORAGE_VOTED = "n-menashe:qa-voted";
export const STORAGE_ANSWERS = "n-menashe:qa-answers";

// ── storage helpers (safe on server: return defaults) ──────

export function loadQuestions(): Question[] {
  let base: Question[];

  if (typeof window === "undefined") {
    base = INITIAL_QUESTIONS;
  } else {
    try {
      const raw = window.localStorage.getItem(STORAGE_Q);
      if (!raw) {
        base = INITIAL_QUESTIONS;
      } else {
        const parsed = JSON.parse(raw) as Question[];
        // Tolerate older stored shapes missing newer fields.
        base = parsed.map((q) => ({
          ...q,
          answers: q.answers ?? 0,
          views: q.views ?? 0,
          tags: q.tags ?? [],
          createdAtTs: q.createdAtTs ?? Date.now(),
        }));
      }
    } catch {
      base = INITIAL_QUESTIONS;
    }
  }

  // The answers store is the source of truth; `answers` is only a cached
  // count, and older stored question lists may have stale values.
  const answers = loadAnswers();
  return base.map((q) => ({
    ...q,
    tags: [...q.tags],
    answers: answers[q.id]?.length ?? 0,
  }));
}

export function saveQuestions(questions: Question[]): void {
  try {
    window.localStorage.setItem(STORAGE_Q, JSON.stringify(questions));
  } catch {
    /* private mode */
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
    /* private mode */
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
    Object.entries(store).map(([id, list]) => [
      id,
      Array.isArray(list) ? [...list] : [],
    ]),
  );
}

export function loadAnswers(): AnswersStore {
  if (typeof window === "undefined") return cloneAnswers(INITIAL_ANSWERS);
  try {
    const raw = window.localStorage.getItem(STORAGE_ANSWERS);
    if (!raw) return cloneAnswers(INITIAL_ANSWERS);
    const parsed = JSON.parse(raw) as AnswersStore;
    // Keep the seeded demo threads and merge in anything the user added.
    return cloneAnswers({ ...INITIAL_ANSWERS, ...parsed });
  } catch {
    return cloneAnswers(INITIAL_ANSWERS);
  }
}

export function saveAnswers(store: AnswersStore): void {
  try {
    window.localStorage.setItem(STORAGE_ANSWERS, JSON.stringify(store));
  } catch {
    /* private mode */
  }
}

// ── misc helpers ────────────────────────────────────────────

export const relTime = (ts: number): string => {
  const diffMin = Math.round((Date.now() - ts) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const h = Math.round(diffMin / 60);
  if (h < 24) return rtf.format(-h, "hour");
  return rtf.format(-Math.round(h / 24), "day");
};

export const initials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
