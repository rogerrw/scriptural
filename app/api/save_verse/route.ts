'use server';
import prisma from '@/prisma';
import * as z from 'zod';
import { UserVerseSchema } from './schema';

export async function saveVerses(params: z.infer<typeof UserVerseSchema>) {
  const { userId, book, chapter, startingVerse } = params;
  await prisma.userVerse.create({
    data: {
      userId,
      book,
      chapter,
      startingVerse,
    },
  });
}
