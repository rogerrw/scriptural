'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';

const SessionIdSchema = z.string().cuid();

export async function endReviewSession(sessionId: string): Promise<{ ended: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ended: false };
  }

  const parsed = SessionIdSchema.safeParse(sessionId);
  if (!parsed.success) {
    return { ended: false };
  }

  const result = await prisma.reviewSession.updateMany({
    where: { id: parsed.data, userId, endedAt: null },
    data: { endedAt: new Date() },
  });

  return { ended: result.count > 0 };
}
