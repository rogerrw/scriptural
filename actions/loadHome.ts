'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';
import { reviewStreakQuery, type ReviewStreak } from '@/lib/review-streak';
import { accountTimeZone } from '@/lib/reviewSettings';

type HomeSummary = {
  timezone: string | null;
  practicedVerses: number;
  completedReviewSessions: number;
  streak: ReviewStreak;
};

export async function loadHome(): Promise<HomeSummary> {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    throw new Error('Home rendered without session.user.id');
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const streakQuery = reviewStreakQuery(accountTimeZone(account?.timezone ?? null), new Date());

  const [practicedVerses, completedReviewSessions, completedSessions] = await Promise.all([
    prisma.userVerse.count({
      where: { userId, userVerseReviews: { some: { reviewedAt: { not: null } } } },
    }),
    prisma.reviewSession.count({ where: { userId, endedAt: { not: null } } }),
    prisma.reviewSession.findMany({
      where: {
        userId,
        endedAt: { gte: streakQuery.start, lt: streakQuery.end },
      },
      select: { planned: true, endedAt: true },
    }),
  ]);

  return {
    timezone: account?.timezone ?? null,
    practicedVerses,
    completedReviewSessions,
    streak: streakQuery.build(
      completedSessions.flatMap((reviewSession) =>
        reviewSession.endedAt === null
          ? []
          : [{ daily: reviewSession.planned, endedAt: reviewSession.endedAt }],
      ),
    ),
  };
}
