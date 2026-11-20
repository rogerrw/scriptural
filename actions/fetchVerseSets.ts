'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';

export async function fetchVerseSets() {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return [];
  }

  return prisma.verseSet.findMany({
    where: { userId },
    include: { verses: true },
  });
}
