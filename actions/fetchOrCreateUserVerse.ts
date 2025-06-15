import { auth } from '@/auth';
import prisma from '@/prisma';
import { z } from 'zod';
import { fetchVerse } from './fetchVerse';

const FetchOrCreateUserVerseSchema = z.object({
  book: z.string(),
  chapter: z.number(),
  startingVerse: z.number(),
  translation: z.string().default('ESV'),
});

export async function fetchOrCreateUserVerse(params: z.infer<typeof FetchOrCreateUserVerseSchema>) {
  const { book, chapter, startingVerse, translation } = params;
  const session = await auth();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }
  const user = session.user;
  if (!user.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const verseText = await fetchVerse(book, chapter, startingVerse, translation);
  if (!verseText) {
    return {
      error: 'This verse does not exist in the Bible.',
    };
  }

  const userVerse = await prisma.userVerse.findFirst({
    where: {
      userId: user.id,
      book,
      chapter,
      startingVerse,
      translation,
    },
  });

  if (userVerse) {
    return userVerse;
  }

  const newUserVerse = await prisma.userVerse.create({
    data: {
      book,
      chapter,
      startingVerse,
      translation,
      userId: user.id,
      verseText: verseText.text,
    },
  });
  return newUserVerse;
}
