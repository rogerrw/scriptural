'use server';

import { randomUUID } from 'node:crypto';
import { Prisma, type PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { nextReviewAt } from '@/lib/nextReviewAt';
import { openReviewSession, recordReviewSessionAttempts } from '@/lib/reviewSession';
import { accountTimeZone } from '@/lib/reviewSettings';
import {
  gradeAttempt,
  replayKeystrokes,
  toWpm,
  type AttemptSummary,
  type Keystroke,
  type Score,
} from '@/lib/typing';

const KeystrokeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('insert'),
    char: z.string().length(1),
    t: z.number().int().nonnegative(),
  }),
  z.object({
    kind: z.literal('delete'),
    t: z.number().int().nonnegative(),
  }),
]);

const RecordAttemptSchema = z.object({
  attemptId: z.string().uuid(),
  book: z.string().min(1).max(40),
  chapter: z.number().int().positive(),
  startingVerse: z.number().int().positive(),
  translation: z.string().min(1).max(20),
  verseText: z.string().min(1).max(4000),
  keystrokes: z.array(KeystrokeSchema).min(1).max(8000),
});

type RecordedReview = {
  grade: number;
  errorCount: number;
  elapsedMs: number;
  cpm: number;
  difficulty: number;
  userVerse: { userId: string };
};

function isDifficulty(value: number): value is Score['difficulty'] {
  return Number.isInteger(value) && value >= 0 && value <= 5;
}

function toScore(review: RecordedReview): Score {
  return {
    grade: review.grade,
    errorCount: review.errorCount,
    elapsedMs: review.elapsedMs,
    cpm: review.cpm,
    difficulty: isDifficulty(review.difficulty) ? review.difficulty : 0,
  };
}

async function summaryFor(
  tx: Prisma.TransactionClient | PrismaClient,
  userId: string,
  passage: { book: string; chapter: number; startingVerse: number },
  userVerseId: number,
  score: Score,
): Promise<AttemptSummary> {
  const [global, mastery, latest] = await Promise.all([
    tx.userVerseReview.aggregate({
      where: { userVerse: { userId } },
      _avg: { cpm: true },
    }),
    tx.userVerseReview.aggregate({
      where: {
        userVerse: {
          userId,
          book: passage.book,
          chapter: passage.chapter,
          startingVerse: passage.startingVerse,
          endingVerse: null,
        },
      },
      _max: { grade: true },
    }),
    tx.userVerseReview.findFirst({
      where: { userVerseId },
      orderBy: [{ reviewedAt: 'desc' }, { id: 'desc' }],
      select: { cpm: true },
    }),
  ]);

  return {
    score,
    wpm: toWpm(score.cpm),
    mastery: mastery._max.grade ?? score.grade,
    globalCpm: global._avg.cpm ?? score.cpm,
    translationCpm: latest?.cpm ?? score.cpm,
  };
}

export async function recordAttempt(
  input: z.infer<typeof RecordAttemptSchema>,
): Promise<{ summary: AttemptSummary } | { error: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = RecordAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid attempt' };
  }

  const data = parsed.data;
  if (data.keystrokes[0].t !== 0) {
    return { error: 'Invalid attempt' };
  }
  for (let index = 1; index < data.keystrokes.length; index += 1) {
    if (data.keystrokes[index].t < data.keystrokes[index - 1].t) {
      return { error: 'Invalid attempt' };
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.userVerseReview.findUnique({
        where: { attemptId: data.attemptId },
        include: {
          userVerse: {
            select: { userId: true, id: true, book: true, chapter: true, startingVerse: true },
          },
        },
      });
      if (existing) {
        if (existing.userVerse.userId !== userId) {
          return { error: 'Invalid attempt' };
        }
        const summary = await summaryFor(
          tx,
          userId,
          existing.userVerse,
          existing.userVerse.id,
          toScore(existing),
        );
        return { summary };
      }

      const saved = await tx.userVerse.findFirst({
        where: {
          userId,
          book: data.book,
          chapter: data.chapter,
          startingVerse: data.startingVerse,
          translation: data.translation,
          endingVerse: null,
        },
      });
      if (saved && saved.verseText !== data.verseText) {
        return { error: 'This attempt does not match the saved verse.' };
      }

      const finished = replayKeystrokes(data.verseText, data.keystrokes as Keystroke[]);
      if (!finished) {
        return { error: 'The verse is not finished.' };
      }

      const [mean, best, account] = await Promise.all([
        tx.userVerseReview.aggregate({
          where: { userVerse: { userId } },
          _avg: { cpm: true },
        }),
        tx.userVerseReview.aggregate({
          where: {
            userVerse: {
              userId,
              book: data.book,
              chapter: data.chapter,
              startingVerse: data.startingVerse,
              endingVerse: null,
            },
          },
          _max: { grade: true },
        }),
        tx.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
      ]);

      const score = gradeAttempt(finished, {
        meanCpm: mean._avg.cpm,
        bestGrade: best._max.grade,
      });

      const userVerse =
        saved ??
        (await tx.userVerse.create({
          data: {
            userId,
            book: data.book,
            chapter: data.chapter,
            startingVerse: data.startingVerse,
            translation: data.translation,
            verseText: data.verseText,
          },
        }));

      const latest = await tx.reviewSession.findFirst({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { id: true, endedAt: true },
      });
      const reviewSession = openReviewSession({
        latestSession: latest ? { ...latest, finishedVerseIds: [] } : null,
        newSessionId: randomUUID(),
      });
      if (!reviewSession.resumed) {
        await tx.reviewSession.create({ data: { id: reviewSession.sessionId, userId } });
      }

      const [attachment] = recordReviewSessionAttempts({
        sessionId: reviewSession.sessionId,
        verseIds: [userVerse.id],
      });
      const reviewedAt = new Date();

      await tx.userVerseReview.create({
        data: {
          attemptId: data.attemptId,
          userVerseId: attachment.userVerseId,
          reviewSessionId: attachment.sessionId,
          reviewedAt,
          difficulty: score.difficulty,
          grade: score.grade,
          errorCount: score.errorCount,
          elapsedMs: score.elapsedMs,
          cpm: score.cpm,
          keystrokes: data.keystrokes,
        },
      });

      await tx.userVerse.update({
        where: { id: userVerse.id },
        data: {
          nextReviewAt: nextReviewAt({
            grade: score.grade,
            now: reviewedAt,
            timeZone: accountTimeZone(account?.timezone ?? null),
          }),
        },
      });

      const summary = await summaryFor(tx, userId, data, userVerse.id, score);
      return { summary };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.userVerseReview.findUnique({
        where: { attemptId: data.attemptId },
        include: {
          userVerse: {
            select: { userId: true, id: true, book: true, chapter: true, startingVerse: true },
          },
        },
      });
      if (!existing || existing.userVerse.userId !== userId) {
        return { error: 'Invalid attempt' };
      }
      const summary = await summaryFor(
        prisma,
        userId,
        existing.userVerse,
        existing.userVerse.id,
        toScore(existing),
      );
      return { summary };
    }
    throw error;
  }
}
