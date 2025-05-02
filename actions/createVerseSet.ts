'use server';
import * as z from 'zod';
import prisma from '@/prisma';

import { VerseSetSchema } from '@/app/(protected)/verse_sets/schema';

export async function createVerseSet(params: z.infer<typeof VerseSetSchema>) {
  const { userId, name } = params;
  const verseSetId = await prisma.verseSet.create({
    data: {
      name,
      userId,
    },
  });

  if (!verseSetId) {
    return {
      error: 'Unable to create verse set',
    };
  }

  return {
    success: 'Verse set added',
  };
}
