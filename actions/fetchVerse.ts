'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Books, Verse } from '@/model/Book.schema';
import BookSchema from '@/model/Book.schema';

const FetchVerseSchema = z.object({
  book: z.string().min(1).max(40),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  translation: z.string().min(1).max(20),
});

export async function fetchVerse(book: string, chapter: number, verse: number, translation: string) {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const parsed = FetchVerseSchema.safeParse({ book, chapter, verse, translation });
  if (!parsed.success) {
    throw new Error('This verse could not be found.');
  }

  try {
    await dbConnect();
    const model = mongoose.model<Books>('Book', BookSchema, parsed.data.book);
    const verseObj = await model.findOne(
      { id: `${parsed.data.book}_${parsed.data.chapter}` },
      { verses: { $elemMatch: { id: `${parsed.data.book}_${parsed.data.chapter}_${parsed.data.verse}` } } },
    );
    if (!verseObj) {
      throw new Error('This verse could not be found.');
    }
    const verseTranslations = verseObj.verses[0];

    return {
      id: verseTranslations.id,
      text: verseTranslations[parsed.data.translation as keyof Verse] as string,
    };
  } catch (error) {
    console.error(`Error with fetching verse: ${error}`);
    throw error;
  } finally {
    delete (mongoose.connection.models as any)['Book'];
  }
}
