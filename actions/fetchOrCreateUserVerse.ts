'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';
import { z } from 'zod';
import { fetchVerse } from './fetchVerse';

const FetchOrCreateUserVerseSchema = z.object({
  book: z.string().min(1).max(40),
  chapter: z.number().int().positive(),
  startingVerse: z.number().int().positive(),
  translation: z.string().min(1).max(20),
});

export async function fetchOrCreateUserVerse(params: z.infer<typeof FetchOrCreateUserVerseSchema>) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = FetchOrCreateUserVerseSchema.safeParse(params);
  if (!parsed.success) {
    return { error: 'This verse does not exist in the Bible.' };
  }

  const { book, chapter, startingVerse, translation } = parsed.data;
  let verseText: { id: string; text: string };
  try {
    verseText = await fetchVerse(book, chapter, startingVerse, translation);
  } catch {
    return { error: 'This verse does not exist in the Bible.' };
  }
  if (!verseText.text) {
    return { error: 'This verse does not exist in the Bible.' };
  }

  const userVerse = await prisma.userVerse.findFirst({
    where: { userId, book, chapter, startingVerse, translation },
  });
  if (userVerse) {
    return userVerse;
  }

  return prisma.userVerse.create({
    data: { book, chapter, startingVerse, translation, userId, verseText: verseText.text },
  });
}
