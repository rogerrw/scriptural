export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5;

export type Keystroke =
  | { kind: 'insert'; char: string; t: number }
  | { kind: 'delete'; t: number };

type AttemptFields = {
  verseText: string;
  typed: string;
  errorCount: number;
  keystrokes: readonly Keystroke[];
};

export type TypingAttempt = AttemptFields & { status: 'typing' };

export type FinishedAttempt = AttemptFields & { status: 'finished'; elapsedMs: number };

export type Attempt = TypingAttempt | FinishedAttempt;

export type TypingHistory = {
  meanCpm: number | null;
  bestGrade: number | null;
};

export type Score = {
  grade: number;
  errorCount: number;
  elapsedMs: number;
  cpm: number;
  difficulty: Difficulty;
};

export function startAttempt(verseText: string): TypingAttempt {
  return {
    status: 'typing',
    verseText,
    typed: '',
    errorCount: 0,
    keystrokes: [],
  };
}

// The on-screen letters already treat case as the same character.
export function charMatches(typed: string, expected: string): boolean {
  return typed.toLowerCase() === expected.toLowerCase();
}

export function applyKeystroke(attempt: Attempt, keystroke: Keystroke): Attempt {
  if (attempt.status === 'finished') {
    return attempt;
  }

  if (keystroke.kind === 'delete') {
    if (attempt.typed.length === 0) {
      return attempt;
    }
    const lastIndex = attempt.typed.length - 1;
    const removed = attempt.typed[lastIndex];
    const expected = attempt.verseText[lastIndex];
    const errorCount =
      expected !== undefined && charMatches(removed, expected)
        ? attempt.errorCount + 1
        : attempt.errorCount;
    return {
      ...attempt,
      typed: attempt.typed.slice(0, -1),
      errorCount,
      keystrokes: [...attempt.keystrokes, keystroke],
    };
  }

  if (keystroke.char.length !== 1 || attempt.typed.length >= attempt.verseText.length) {
    return attempt;
  }

  const index = attempt.typed.length;
  const expected = attempt.verseText[index];
  const errorCount = charMatches(keystroke.char, expected)
    ? attempt.errorCount
    : attempt.errorCount + 1;
  const typed = attempt.typed + keystroke.char;
  const keystrokes = [...attempt.keystrokes, keystroke];

  if (typed.length < attempt.verseText.length) {
    return { ...attempt, typed, errorCount, keystrokes };
  }

  return {
    status: 'finished',
    verseText: attempt.verseText,
    typed,
    errorCount,
    keystrokes,
    elapsedMs: keystroke.t,
  };
}

export function replayKeystrokes(
  verseText: string,
  keystrokes: readonly Keystroke[],
): FinishedAttempt | null {
  const attempt = keystrokes.reduce<Attempt>(
    (current, keystroke) => applyKeystroke(current, keystroke),
    startAttempt(verseText),
  );
  return attempt.status === 'finished' ? attempt : null;
}

export function difficultyFor(mastery: number): Difficulty {
  const step = Math.floor(mastery / 20);
  return Math.min(5, Math.max(0, step)) as Difficulty;
}

export function gradeAttempt(attempt: FinishedAttempt, history: TypingHistory): Score {
  const length = attempt.verseText.length;
  const difficulty = difficultyFor(history.bestGrade ?? 0);
  const elapsedMs = attempt.elapsedMs;
  const cpm = length === 0 ? 0 : (length * 60000) / Math.max(elapsedMs, 1);

  if (length === 0) {
    return { grade: 0, errorCount: attempt.errorCount, elapsedMs, cpm: 0, difficulty };
  }

  const accuracy = Math.max(0, (1 - attempt.errorCount / length) * 60);
  const baseCpm = history.meanCpm ?? 250;
  const targetSeconds = (length / baseCpm) * 60 * (1 - 0.05 * difficulty);
  const elapsedSeconds = elapsedMs / 1000;
  let speed = 0;
  if (elapsedSeconds <= targetSeconds) {
    speed = 40;
  } else if (elapsedSeconds < targetSeconds * 2) {
    speed = (40 * (targetSeconds * 2 - elapsedSeconds)) / targetSeconds;
  }
  const grade = Math.min(100, Math.max(0, accuracy + speed));

  return {
    grade,
    errorCount: attempt.errorCount,
    elapsedMs,
    cpm,
    difficulty,
  };
}

export function toWpm(cpm: number): number {
  return cpm / 5;
}

export type AttemptSummary = {
  score: Score;
  wpm: number;
  mastery: number;
  globalCpm: number;
  translationCpm: number;
};
