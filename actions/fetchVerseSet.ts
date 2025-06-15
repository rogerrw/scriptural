'use server';

import prisma from '@/prisma';
import { fetchVerse } from './fetchVerse';

export async function fetchVerseSet(id: string) {
  const verseSet = await prisma.verseSet.findUnique({
    where: {
      id,
    },
    include: {
      verses: {
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
