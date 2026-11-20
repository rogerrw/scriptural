'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { isTimeZone } from '@/lib/reviewSettings';
import { reviewYearQuery, type ReviewYear } from '@/lib/review-year';

const TimeZoneSchema = z.string().min(1).max(60).refine(isTimeZone, 'Unknown timezone.');

export async function loadReviewYear(timeZoneInput: string): Promise<ReviewYear> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const parsed = TimeZoneSchema.safeParse(timeZoneInput);
  if (!parsed.success) {
    throw new Error('Invalid time zone');
  }

  const query = reviewYearQuery(parsed.data, new Date());
  const rows = await prisma.userVerseReview.findMany({
    where: {
      reviewedAt: { gte: query.start, lt: query.end },
      userVerse: { userId },
    },
    select: { userVerseId: true, reviewedAt: true },
  });

  return query.build(rows.filter((row): row is { userVerseId: number; reviewedAt: Date } => row.reviewedAt !== null));
}
