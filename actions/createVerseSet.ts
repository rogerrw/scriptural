'use server';
import * as z from 'zod';
import prisma from '@/prisma';
import { UserVerseSet } from '@prisma/client';
import { CollectionSchema } from '@/app/(protected)/verse_sets/schema';

export async function createVerseSet(params: z.infer<typeof CollectionSchema>) {
  const { userId, name } = params;
  const verseSetId = await prisma.verseSet.create({
    data: {
      name,
    },
    select: {
      id: true, // only return collectionId
    },
  });

  if (!verseSetId) {
    return {
      error: 'Unable to create verse set',
    };
  }

  const userVerseSet: UserVerseSet = await prisma.userVerseSet.create({
    data: {
      userId: userId,
      verseSetId: verseSetId.id,
    },
  });
  if (!userVerseSet) {
    return {
      error: 'Unable to add verse set to user',
    };
  }

  return {
    success: 'Verse set added',
  };
}
