import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

export type LatestSession = {
  readonly id: string;
  readonly endedAt: Date | null;
  readonly finishedVerseIds: readonly number[];
};

export type ReviewSession =
  | {
      readonly sessionId: string;
      readonly resumed: true;
      readonly finishedVerseIds: readonly number[];
    }
  | {
      readonly resumed: false;
      readonly finishedVerseIds: readonly [];
    };

export type ReviewSessionAttempt = {
  readonly sessionId: string;
  readonly userVerseId: number;
};

export function openReviewSession(input: {
  readonly latestSession: LatestSession | null;
}): ReviewSession {
  const latest = input.latestSession;
  if (latest !== null && latest.endedAt === null) {
    return {
      sessionId: latest.id,
      resumed: true,
      finishedVerseIds: latest.finishedVerseIds,
    };
  }
  return { resumed: false, finishedVerseIds: [] };
}

export function recordReviewSessionAttempts(input: {
  readonly sessionId: string;
  readonly verseIds: readonly number[];
}): readonly ReviewSessionAttempt[] {
  return input.verseIds.map((userVerseId) => ({ sessionId: input.sessionId, userVerseId }));
}

export type ReviewSessionRequest =
  | { readonly kind: 'due' }
  | { readonly kind: 'set'; readonly setName: string }
  | { readonly kind: 'card'; readonly setId: string; readonly startId: number };

export type ReviewSessionVerse = {
  readonly id: number;
  readonly reviewId: number | null;
  readonly reference: string;
  readonly book: string;
  readonly chapter: number;
  readonly startingVerse: number;
  readonly translation: string;
  readonly verseText: string;
};

export type FinishedVerse = {
  readonly id: number;
  readonly reviewId: number | null;
  readonly reference: string;
  readonly translation: string;
  readonly grade: number;
  readonly difficulty: number;
  readonly wpm: number;
};

export type LoadedReviewSession =
  | { readonly status: 'no-verses' }
  | { readonly status: 'nothing-due'; readonly soonestDue: string | null }
  | {
      readonly status: 'ready';
      readonly sessionId: string;
      readonly startIndex: number;
      readonly verses: readonly ReviewSessionVerse[];
      readonly finished: readonly FinishedVerse[];
    };

export type ReviewSessionCandidate = {
  readonly nextReviewAt: Date | null;
  readonly setNames: readonly string[];
};

export type EmptyReviewSession = Extract<LoadedReviewSession, { status: 'no-verses' | 'nothing-due' }>;

function soonestDueAfter(
  verses: readonly ReviewSessionCandidate[],
  now: Date,
  timeZone: string,
): string | null {
  const upcoming = verses
    .map((verse) => verse.nextReviewAt)
    .filter((due): due is Date => due !== null && due.getTime() > now.getTime())
    .sort((left, right) => left.getTime() - right.getTime());
  if (upcoming.length === 0) {
    return null;
  }
  return format(new TZDate(upcoming[0], timeZone), 'MMM d, yyyy, h:mm a');
}

export function emptyReviewSession(input: {
  readonly verses: readonly ReviewSessionCandidate[];
  readonly request: Extract<ReviewSessionRequest, { kind: 'due' | 'set' }>;
  readonly now: Date;
  readonly timeZone: string;
}): EmptyReviewSession {
  const { verses, request, now, timeZone } = input;
  if (verses.length === 0) {
    return { status: 'no-verses' };
  }

  const scope =
    request.kind === 'set'
      ? verses.filter((verse) => verse.setNames.includes(request.setName))
      : verses;
  const soonestDue = soonestDueAfter(scope, now, timeZone);

  if (request.kind === 'due' && soonestDue === null) {
    return { status: 'no-verses' };
  }
  return { status: 'nothing-due', soonestDue };
}

export function verseReference(passage: {
  readonly book: string;
  readonly chapter: number;
  readonly startingVerse: number;
  readonly endingVerse?: number | null;
}): string {
  const opening = `${passage.book} ${passage.chapter}:${passage.startingVerse}`;
  return passage.endingVerse ? `${opening}-${passage.endingVerse}` : opening;
}

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseReviewSessionRequest(params: {
  readonly [key: string]: string | string[] | undefined;
}): ReviewSessionRequest {
  const setId = single(params.setId);
  const startId = Number(single(params.startId));
  if (setId !== undefined && setId.length > 0 && Number.isInteger(startId) && startId > 0) {
    return { kind: 'card', setId, startId };
  }
  const setName = single(params.set);
  if (setName !== undefined && setName.length > 0) {
    return { kind: 'set', setName };
  }
  return { kind: 'due' };
}
