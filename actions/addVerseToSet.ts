'use server';
import prisma from '@/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { fetchOrCreateUserVerse } from './fetchOrCreateUserVerse';
const AddVerseSchema = z.object({
  verseSetId: z.string(),
  book: z.string(),
  chapter: z.number(),
  startingVerse: z.number(),
  translation: z.string().default('ESV'),
});

export async function addVerseToSet(params: z.infer<typeof AddVerseSchema>) {
  const { verseSetId, book, chapter, startingVerse, translation } = params;
  const session = await auth();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }
  try {
    const userVerse = await fetchOrCreateUserVerse({
      book,
      chapter,
      startingVerse,
      translation,
    });
    if ('error' in userVerse) {
      return {
        error: userVerse.error,
      };
    }
    const verseSet = await prisma.verseSet.findUnique({
      where: {
        id: verseSetId,
      },
    });
    if (!verseSet) {
      return { error: 'Verse set not found' };
    }

    await prisma.verseSetVerse.create({
      data: {
        verseSetId,
        userVerseId: userVerse.id,
      },
    });

    return {
      success: 'Verse added to set successfully',
    };
  } catch (error) {
    return {
      error: `Failed to add verse to set: ${error}`,
    };
  }
}
