'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';

export async function endReviewSession(sessionId: string): Promise<{ ended: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ended: false };
  }

  const result = await prisma.reviewSession.updateMany({
    where: { id: sessionId, userId, endedAt: null },
    data: { endedAt: new Date() },
  });

  return { ended: result.count > 0 };
}
