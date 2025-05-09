'use server';
import * as z from 'zod';
import prisma from '@/prisma';

import { VerseSetSchema } from '@/app/(protected)/verse_sets/schema';

export async function createVerseSet(params: z.infer<typeof VerseSetSchema>) {
  const { userId, name } = params;
  try {
    const verseSet = await prisma.verseSet.create({
      data: {
        name,
        userId,
      },
    });
    return {
      success: 'Verse set added',
      verseSet,
    };
  } catch (error) {
    console.error(`Error with creating verse set: ${error}`);
    return {
      error: 'Unable to create verse set',
    };
  }
}
