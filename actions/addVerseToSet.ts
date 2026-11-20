'use server';
import { revalidatePath } from 'next/cache';
import prisma from '@/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { fetchOrCreateUserVerse } from './fetchOrCreateUserVerse';

const AddVerseSchema = z.object({
  verseSetId: z.string().cuid(),
  book: z.string().min(1).max(40),
  chapter: z.number().int().positive(),
  startingVerse: z.number().int().positive(),
  translation: z.string().min(1).max(20),
});

export async function addVerseToSet(params: z.infer<typeof AddVerseSchema>) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = AddVerseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: 'Invalid verse' };
  }

  const { verseSetId, book, chapter, startingVerse, translation } = parsed.data;

  try {
    const verseSet = await prisma.verseSet.findFirst({
      where: { id: verseSetId, userId },
      select: { id: true },
    });
    if (!verseSet) {
      return { error: 'Verse set not found' };
    }

    const userVerse = await fetchOrCreateUserVerse({
      book,
      chapter,
      startingVerse,
      translation,
    });
    if ('error' in userVerse) {
      return { error: userVerse.error };
    }

    await prisma.verseSetVerse.create({
      data: { verseSetId, userVerseId: userVerse.id },
    });

    revalidatePath(`/verse_sets/${verseSetId}`);

    return { success: 'Verse added to set successfully' };
  } catch (error) {
    return { error: `Failed to add verse to set: ${error}` };
  }
}
