import {
  INITIAL_ANSWERS,
  INITIAL_QUESTIONS,
  loadAnswers,
  loadQuestions,
  loadVoted,
  type AnswersStore,
  type Question,
} from "./qa-data";

export interface QaSnapshot {
  questions: Question[];
  answers: AnswersStore;
  voted: string[];
}

const QA_CHANGED_EVENT = "n-menashe:qa-changed";

const SERVER_SNAPSHOT: QaSnapshot = {
  questions: INITIAL_QUESTIONS,
  answers: INITIAL_ANSWERS,
  voted: [],
};

let cachedSnapshot = SERVER_SNAPSHOT;
let cachedKey = "";

export function getQaSnapshot(): QaSnapshot {
  const answers = loadAnswers();
  const snapshot: QaSnapshot = {
    questions: loadQuestions(answers),
    answers,
    voted: [...loadVoted()],
  };

  const key = JSON.stringify(snapshot);
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = snapshot;
  }

  return cachedSnapshot;
}

export const getServerQaSnapshot = () => SERVER_SNAPSHOT;

export function subscribeQaStore(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith("n-menashe:qa")) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(QA_CHANGED_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(QA_CHANGED_EVENT, onChange);
  };
}

export function publishQaChange() {
  window.dispatchEvent(new Event(QA_CHANGED_EVENT));
}
