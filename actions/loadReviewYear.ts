'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';
import { reviewYearQuery, type ReviewYear } from '@/lib/review-year';

export async function loadReviewYear(timeZoneInput: string): Promise<ReviewYear> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const query = reviewYearQuery(timeZoneInput, new Date());
  const rows = await prisma.userVerseReview.findMany({
    where: {
      reviewedAt: { gte: query.start, lt: query.end },
      userVerse: { userId },
    },
    select: { userVerseId: true, reviewedAt: true },
  });

  return query.build(rows);
}
