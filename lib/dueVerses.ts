export type DueVerse = {
  readonly id: number;
  readonly userId: string;
  readonly reference: string;
  readonly translation: string;
  readonly nextReviewAt: Date | null;
  readonly reviewCount: number;
  readonly mastery: number | null;
  readonly setNames: readonly string[];
};

export type CardVerse = {
  readonly id: number;
  readonly reference: string;
  readonly translation: string;
  readonly listIndex: number;
  readonly nextReviewAt: Date | null;
};

function isDue(nextReviewAt: Date | null, now: Date): boolean {
  return nextReviewAt === null || nextReviewAt.getTime() <= now.getTime();
}

function unseenRank(verse: DueVerse): number {
  return verse.reviewCount === 0 ? 0 : 1;
}

function byDueTime(left: Date | null, right: Date | null): number {
  if (left === null) {
    return right === null ? 0 : -1;
  }
  if (right === null) {
    return 1;
  }
  return left.getTime() - right.getTime();
}

function byReviewSessionOrder(left: DueVerse, right: DueVerse): number {
  const unseen = unseenRank(left) - unseenRank(right);
  if (unseen !== 0) {
    return unseen;
  }
  const mastery = (left.mastery ?? 0) - (right.mastery ?? 0);
  if (mastery !== 0) {
    return mastery;
  }
  return byDueTime(left.nextReviewAt, right.nextReviewAt);
}

export function selectDueReviewSession<Verse extends DueVerse>(input: {
  readonly verses: readonly Verse[];
  readonly userId: string;
  readonly now: Date;
  readonly reviewLimit: number;
  readonly setName?: string;
  readonly finishedVerseIds?: readonly number[];
}): readonly Verse[] {
  const finished = new Set(input.finishedVerseIds ?? []);
  const taken = new Set<number>();
  const candidates: Verse[] = [];

  for (const verse of input.verses) {
    const belongs =
      verse.userId === input.userId &&
      (input.setName === undefined || verse.setNames.includes(input.setName));
    if (!belongs || finished.has(verse.id) || taken.has(verse.id)) {
      continue;
    }
    if (!isDue(verse.nextReviewAt, input.now)) {
      continue;
    }
    taken.add(verse.id);
    candidates.push(verse);
  }

  return candidates.sort(byReviewSessionOrder).slice(0, Math.max(0, input.reviewLimit));
}

export type StoredVerse = {
  readonly id: number;
  readonly userId: string;
  readonly reference: string;
  readonly translation: string;
  readonly nextReviewAt: Date | null;
  readonly setNames: readonly string[];
  readonly highestScore: number | null;
  readonly mostRecentScore: number | null;
  readonly lastReviewedAt: Date | null;
};

export type PlannedAttempt = {
  readonly userVerseId: number;
  readonly difficulty: 0 | 1 | 2 | 3 | 4 | 5;
};

function tierForScore(score: number | null): PlannedAttempt['difficulty'] {
  if (score === null) {
    return 0;
  }
  const step = Math.floor(score / 20);
  return Math.min(5, Math.max(0, step)) as PlannedAttempt['difficulty'];
}

function passDifficulty(tier: PlannedAttempt['difficulty'], pass: number): PlannedAttempt['difficulty'] {
  return Math.min(5, tier + pass) as PlannedAttempt['difficulty'];
}

function compareRecency(left: Date | null, right: Date | null): number {
  if (left === null) {
    return right === null ? 0 : -1;
  }
  if (right === null) {
    return 1;
  }
  return left.getTime() - right.getTime();
}

function compareScore(left: number | null, right: number | null): number {
  if (left === null) {
    return right === null ? 0 : -1;
  }
  if (right === null) {
    return 1;
  }
  return left - right;
}

function byFiller(left: StoredVerse, right: StoredVerse): number {
  const recency = compareRecency(left.lastReviewedAt, right.lastReviewedAt);
  if (recency !== 0) {
    return recency;
  }
  const familiarity = compareScore(left.highestScore, right.highestScore);
  if (familiarity !== 0) {
    return familiarity;
  }
  const recentScore = compareScore(left.mostRecentScore, right.mostRecentScore);
  if (recentScore !== 0) {
    return recentScore;
  }
  return left.id - right.id;
}

function passCounts(verseCount: number, reviewLimit: number): number[] {
  const target = Math.ceil(reviewLimit / 2);
  if (verseCount >= target) {
    const counts = Array<number>(verseCount).fill(2);
    if (reviewLimit % 2 === 1) {
      counts[verseCount - 1] = 1;
    }
    return counts;
  }
  const base = Math.floor(reviewLimit / verseCount);
  const extra = reviewLimit % verseCount;
  return Array.from({ length: verseCount }, (_, index) => base + (index < extra ? 1 : 0));
}

export function generateReviewSession(input: {
  readonly verses: readonly StoredVerse[];
  readonly userId: string;
  readonly now: Date;
  readonly reviewLimit: number;
}): readonly PlannedAttempt[] {
  if (input.reviewLimit <= 0) {
    return [];
  }

  const mine = input.verses.filter((verse) => verse.userId === input.userId);
  if (mine.length === 0) {
    return [];
  }

  const byId = new Map(mine.map((verse) => [verse.id, verse]));
  const distinctTarget = Math.ceil(input.reviewLimit / 2);
  const due = selectDueReviewSession({
    verses: mine.map((verse) => ({
      id: verse.id,
      userId: verse.userId,
      reference: verse.reference,
      translation: verse.translation,
      nextReviewAt: verse.nextReviewAt,
      reviewCount: verse.lastReviewedAt === null ? 0 : 1,
      mastery: verse.highestScore,
      setNames: verse.setNames,
    })),
    userId: input.userId,
    now: input.now,
    reviewLimit: distinctTarget,
  });
  const selected: StoredVerse[] = [];
  for (const verse of due) {
    const stored = byId.get(verse.id);
    if (stored) {
      selected.push(stored);
    }
  }

  if (selected.length < distinctTarget) {
    const chosen = new Set(selected.map((verse) => verse.id));
    const fillers = mine
      .filter((verse) => !chosen.has(verse.id) && !isDue(verse.nextReviewAt, input.now))
      .sort(byFiller);
    for (const filler of fillers) {
      if (selected.length >= distinctTarget) {
        break;
      }
      selected.push(filler);
    }
  }

  if (selected.length === 0) {
    return [];
  }

  const counts = passCounts(selected.length, input.reviewLimit);
  const attempts: PlannedAttempt[] = [];
  const maxPass = Math.max(...counts);
  for (let pass = 0; pass < maxPass; pass += 1) {
    for (let index = 0; index < selected.length; index += 1) {
      if (pass >= counts[index]) {
        continue;
      }
      const verse = selected[index];
      attempts.push({
        userVerseId: verse.id,
        difficulty: passDifficulty(tierForScore(verse.highestScore), pass),
      });
    }
  }
  return attempts;
}

export function selectCardReviewSession<Verse extends CardVerse>(input: {
  readonly verses: readonly Verse[];
  readonly startId: number;
  readonly reviewLimit: number;
}): readonly Verse[] {
  const ordered = [...input.verses].sort((left, right) => left.listIndex - right.listIndex);
  const start = ordered.findIndex((verse) => verse.id === input.startId);
  if (start < 0) {
    return [];
  }
  return ordered.slice(start, start + Math.max(0, input.reviewLimit));
}
