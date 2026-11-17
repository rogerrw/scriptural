'use server';

import prisma from '@/prisma';

export async function fetchVerseSet(id: string) {
  const verseSet = await prisma.verseSet.findUnique({
    where: {
      id,
    },
    include: {
      verses: {
        orderBy: { id: 'asc' },
        include: {
          userVerse: true,
        },
      },
    },
  });
  if (!verseSet) {
    return {
      error: 'Verse set not found',
    };
  }

  return {
    ...verseSet,
  };
}
