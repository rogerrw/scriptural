'use server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Books, Verse } from '@/model/Book.schema';
import BookSchema from '@/model/Book.schema';

export async function fetchVerse(
  book: string,
  chapter: number,
  verse: number,
  translation?: string,
) {
  try {
    await dbConnect();
    const model = mongoose.model<Books>('Book', BookSchema, book);
    const verseObj = await model.findOne(
      { id: `${book}_${chapter}` },
      { verses: { $elemMatch: { id: `${book}_${chapter}_${verse}` } } },
    );
    if (!verseObj) {
      return;
    }
    const verseTranslations = verseObj.verses[0];
    if (translation) {
      return {
        id: verseTranslations.id,
        text: verseTranslations[translation as keyof Verse],
      };
    }
    return verseTranslations;
  } catch (error) {
    console.error(`Error with fetching verse: ${error}`);
  } finally {
    delete (mongoose.connection.models as any)['Book'];
  }
}
