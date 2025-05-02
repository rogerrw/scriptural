'use server';

import prisma from '@/prisma';

export async function fetchVerseSets(userId: string) {
  const verseSet = await prisma.verseSet.findMany({
    where: {
      userId,
    },
    include: {
      verses: true,
    },
  });
  return verseSet;
}
