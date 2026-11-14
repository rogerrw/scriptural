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
