'use server';

import prisma from '@/prisma';

export async function fetchVerseSet(id: string) {
  const verseSet = await prisma.verseSet.findUnique({
    where: {
      id,
    },
    include: {
      verses: true,
    },
  });
  return verseSet;
}
