'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';

const VerseSetIdSchema = z.string().cuid();

export async function fetchVerseSet(id: string) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Verse set not found' };
  }

  const parsed = VerseSetIdSchema.safeParse(id);
  if (!parsed.success) {
    return { error: 'Verse set not found' };
  }

  const verseSet = await prisma.verseSet.findFirst({
    where: { id: parsed.data, userId },
    include: {
      verses: {
        orderBy: { id: 'asc' },
        include: { userVerse: true },
      },
    },
  });
  if (!verseSet) {
    return { error: 'Verse set not found' };
  }

  return verseSet;
}
