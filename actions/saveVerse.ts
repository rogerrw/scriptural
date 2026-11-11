'use server';
import prisma from '@/prisma';
import { fetchVerse } from './fetchVerse';

export async function saveVerses(params: {
  userId: string;
  book: string;
  chapter: number;
  startingVerse: number;
  translation: string;
}) {
  const { userId, book, chapter, startingVerse, translation } = params;

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
    where: {
      userId,
      book,
      chapter,
      startingVerse,
      translation,
    },
  });
  if (findFirst) {
    return {
      error: 'Already saved this verse',
    };
  }
  await prisma.userVerse.create({
    data: {
      userId,
      book,
      chapter,
      startingVerse,
      translation,
      verseText,
    },
  });

  return {
    success: 'Verse saved in collection!',
  };
}
