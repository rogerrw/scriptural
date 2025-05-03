'use server';
import prisma from '@/prisma';
import { z } from 'zod';

const AddVerseSchema = z.object({
  verseSetId: z.string(),
  book: z.string(),
  chapter: z.number(),
  verse: z.number(),
  translation: z.string().default('ESV'),
});

export async function addVerseToSet(params: z.infer<typeof AddVerseSchema>) {
  const { verseSetId, book, chapter, verse, translation } = params;

  try {
    await prisma.verseSetVerse.create({
      data: {
        verseSetId,
        book,
        chapter,
        verse,
      },
    });

    return {
      success: 'Verse added to set successfully',
    };
  } catch (error) {
    return {
      error: 'Failed to add verse to set',
    };
  }
}
