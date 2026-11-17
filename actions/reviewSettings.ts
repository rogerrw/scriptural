'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { isTimeZone, REVIEW_LIMIT_MAX, REVIEW_LIMIT_MIN } from '@/lib/reviewSettings';

const TimeZoneSchema = z.string().min(1).max(60).refine(isTimeZone, 'Unknown timezone.');

const ReviewSettingsSchema = z.object({
  reviewLimit: z.number().int().min(REVIEW_LIMIT_MIN).max(REVIEW_LIMIT_MAX),
  timezone: TimeZoneSchema.optional(),
});

export async function updateReviewSettings(
  input: z.infer<typeof ReviewSettingsSchema>,
): Promise<{ success: string } | { error: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = ReviewSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: `A review limit from ${REVIEW_LIMIT_MIN} to ${REVIEW_LIMIT_MAX} and a known IANA timezone are required.`,
    };
  }

  const { reviewLimit, timezone } = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: timezone === undefined ? { reviewLimit } : { reviewLimit, timezone },
  });

  return { success: 'Review settings saved.' };
}

export async function storeBrowserTimezone(timezone: string): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return;
  }

  const parsed = TimeZoneSchema.safeParse(timezone);
  if (!parsed.success) {
    return;
  }

  await prisma.user.updateMany({
    where: { id: userId, timezone: null },
    data: { timezone: parsed.data },
  });
}
