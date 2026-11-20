'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { VerseSetSchema } from '@/app/(protected)/verse_sets/schema';

export async function createVerseSet(params: z.infer<typeof VerseSetSchema>) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = VerseSetSchema.safeParse(params);
  if (!parsed.success) {
    return { error: 'Unable to create verse set' };
  }

  try {
    const verseSet = await prisma.verseSet.create({
      data: { name: parsed.data.name, userId },
    });
    return { success: 'Verse set added', verseSet };
  } catch (error) {
    console.error(`Error with creating verse set: ${error}`);
    return { error: 'Unable to create verse set' };
  }
}
