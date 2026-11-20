'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';
import { fetchVerse } from './fetchVerse';

const SaveVerseSchema = z.object({
  book: z.string().min(1).max(40),
  chapter: z.number().int().positive(),
  startingVerse: z.number().int().positive(),
  translation: z.string().min(1).max(20),
});

export async function saveVerses(params: z.infer<typeof SaveVerseSchema>) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = SaveVerseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: 'This verse could not be found.' };
  }

  const { book, chapter, startingVerse, translation } = parsed.data;

  let verseText: string;
  try {
    const verse = await fetchVerse(book, chapter, startingVerse, translation);
    verseText = verse.text;
  } catch {
    return { error: 'This verse could not be found.' };
  }
  if (!verseText) {
    return { error: 'This verse could not be found.' };
  }

  const findFirst = await prisma.userVerse.findFirst({
    where: { userId, book, chapter, startingVerse, translation },
  });
  if (findFirst) {
    return { error: 'Already saved this verse' };
  }

  await prisma.userVerse.create({
    data: { userId, book, chapter, startingVerse, translation, verseText },
  });

  return { success: 'Verse saved.' };
}
