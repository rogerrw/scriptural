'use server';

import { randomUUID } from 'node:crypto';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { selectCardReviewSession, selectDueReviewSession } from '@/lib/dueVerses';
import { openReviewSession } from '@/lib/reviewSession';
import { accountTimeZone } from '@/lib/reviewSettings';
import {
  emptyReviewSession,
  verseReference,
  type EmptyReviewSession,
  type FinishedVerse,
  type LoadedReviewSession,
  type ReviewSessionRequest,
  type ReviewSessionVerse,
} from '@/lib/reviewSession';
import { toWpm } from '@/lib/typing';

const PASSAGE = {
  id: true,
  userId: true,
  book: true,
  chapter: true,
  startingVerse: true,
  endingVerse: true,
  translation: true,
  verseText: true,
  nextReviewAt: true,
} as const;

type Remaining = { readonly verses: readonly ReviewSessionVerse[] } | { readonly empty: EmptyReviewSession };

type Passage = {
  id: number;
  userId: string;
  book: string;
  chapter: number;
  startingVerse: number;
  endingVerse: number | null;
  translation: string;
  verseText: string;
  nextReviewAt: Date | null;
};

function reviewSessionVerse(passage: Passage): ReviewSessionVerse {
  return {
    id: passage.id,
    reference: verseReference(passage),
    book: passage.book,
    chapter: passage.chapter,
    startingVerse: passage.startingVerse,
    translation: passage.translation,
    verseText: passage.verseText,
  };
}

export async function loadReviewSession(request: ReviewSessionRequest): Promise<LoadedReviewSession> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { reviewLimit: true, timezone: true },
  });
  if (!account) {
    throw new Error('Unauthorized');
  }

  const now = new Date();
  const timeZone = accountTimeZone(account.timezone);

  const latest = await prisma.reviewSession.findFirst({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      endedAt: true,
      userVerseReviews: {
        orderBy: { id: 'asc' },
        select: {
          userVerseId: true,
          grade: true,
          difficulty: true,
          cpm: true,
          userVerse: { select: PASSAGE },
        },
      },
    },
  });

  const reviewSession = openReviewSession({
    latestSession: latest
      ? {
          id: latest.id,
          endedAt: latest.endedAt,
          finishedVerseIds: latest.userVerseReviews.map((review) => review.userVerseId),
        }
      : null,
    newSessionId: randomUUID(),
  });

  const finished: readonly FinishedVerse[] = reviewSession.resumed
    ? (latest?.userVerseReviews ?? []).map((review) => ({
        id: review.userVerseId,
        reference: verseReference(review.userVerse),
        translation: review.userVerse.translation,
        grade: review.grade,
        difficulty: review.difficulty,
        wpm: toWpm(review.cpm),
      }))
    : [];

  const remaining =
    request.kind === 'card'
      ? await cardVerses({
          userId,
          setId: request.setId,
          startId: request.startId,
          reviewLimit: account.reviewLimit,
          finishedVerseIds: reviewSession.finishedVerseIds,
        })
      : await dueVerses({
          userId,
          request,
          reviewLimit: account.reviewLimit,
          finishedVerseIds: reviewSession.finishedVerseIds,
          now,
          timeZone,
        });

  if ('empty' in remaining) {
    return finished.length > 0
      ? { status: 'ready', sessionId: reviewSession.sessionId, verses: [], finished }
      : remaining.empty;
  }

  if (!reviewSession.resumed) {
    await prisma.reviewSession.create({ data: { id: reviewSession.sessionId, userId } });
  }

  return { status: 'ready', sessionId: reviewSession.sessionId, verses: remaining.verses, finished };
}

async function dueVerses(input: {
  userId: string;
  request: Extract<ReviewSessionRequest, { kind: 'due' | 'set' }>;
  reviewLimit: number;
  finishedVerseIds: readonly number[];
  now: Date;
  timeZone: string;
}): Promise<Remaining> {
  const { userId, request, reviewLimit, finishedVerseIds, now, timeZone } = input;
  const rows = await prisma.userVerse.findMany({
    where: { userId },
    select: {
      ...PASSAGE,
      _count: { select: { userVerseReviews: true } },
      userVerseReviews: { select: { grade: true }, orderBy: { grade: 'desc' }, take: 1 },
      VerseSetVerse: { select: { verseSet: { select: { name: true } } } },
    },
  });

  const verses = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    reference: verseReference(row),
    translation: row.translation,
    nextReviewAt: row.nextReviewAt,
    reviewCount: row._count.userVerseReviews,
    mastery: row.userVerseReviews[0]?.grade ?? null,
    setNames: row.VerseSetVerse.map((link) => link.verseSet.name),
    passage: row,
  }));

  const chosen = selectDueReviewSession({
    verses,
    userId,
    now,
    reviewLimit,
    setName: request.kind === 'set' ? request.setName : undefined,
    finishedVerseIds,
  });

  if (chosen.length === 0) {
    return { empty: emptyReviewSession({ verses, request, now, timeZone }) };
  }

  return { verses: chosen.map((row) => reviewSessionVerse(row.passage)) };
}

async function cardVerses(input: {
  userId: string;
  setId: string;
  startId: number;
  reviewLimit: number;
  finishedVerseIds: readonly number[];
}): Promise<Remaining> {
  const { userId, setId, startId, reviewLimit, finishedVerseIds } = input;
  const set = await prisma.verseSet.findFirst({
    where: { id: setId, userId },
    select: {
      verses: { orderBy: { id: 'asc' }, select: { userVerse: { select: PASSAGE } } },
    },
  });
  if (!set || set.verses.length === 0) {
    return { empty: { status: 'no-verses' } };
  }

  const finished = new Set(finishedVerseIds);
  const chosen = selectCardReviewSession({
    verses: set.verses.map((link, listIndex) => ({
      id: link.userVerse.id,
      reference: verseReference(link.userVerse),
      translation: link.userVerse.translation,
      listIndex,
      nextReviewAt: link.userVerse.nextReviewAt,
      passage: link.userVerse,
    })),
    startId,
    reviewLimit,
  }).filter((row) => !finished.has(row.id));

  if (chosen.length === 0) {
    return { empty: { status: 'no-verses' } };
  }

  return { verses: chosen.map((row) => reviewSessionVerse(row.passage)) };
}
