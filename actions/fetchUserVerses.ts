'use server';

import prisma from '@/prisma';

export async function fetchUserVerses(userId: string) {
  return prisma.userVerse.findMany({
    where: { userId },
    orderBy: { id: 'asc' },
  });
}
