'use server';
import prisma from '@/prisma';
import * as z from 'zod';
import { UserVerseSchema } from '../app/schemas/userverse_schema';

export async function saveVerses(params: z.infer<typeof UserVerseSchema>) {
  const { userId, book, chapter, startingVerse } = params;

  const findFirst = await prisma.userVerse.findFirst({
    where: {
      userId,
      book,
      chapter,
      startingVerse,
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
    },
  });

  return {
    success: 'Verse saved in collection!',
  };
}
