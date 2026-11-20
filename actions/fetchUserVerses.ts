'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';

export async function fetchUserVerses() {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return [];
  }

  return prisma.userVerse.findMany({
    where: { userId },
    orderBy: { id: 'asc' },
  });
}
