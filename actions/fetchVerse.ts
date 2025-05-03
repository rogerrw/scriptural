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
        [translation]: verseTranslations[translation as keyof Verse],
      };
    }
    console.log(verseTranslations);
    return verseTranslations;
  } catch (error) {
    console.error(`Error with fetching verse: ${error}`);
  } finally {
    delete (mongoose.connection.models as any)['Book'];
  }

  // if (book && chapter && verse) {
  //   let url = `/api/fetch_verse?book=${book}&chapter=${chapter}&verse=${verse}`;
  //   if (translation) {
  //     url += `&translation=${translation}`;
  //   }
  //   try {
  //     const res = await fetch(url);
  //     if (!res.ok) {
  //       throw new Error('Invalid verse');
  //     }

  //     const result = await res.json();
  //     if (translation) {
  //       return result[translation];
  //     }
  //     // Return ESV by default
  //     return result['ESV'];
  //   } catch (err) {
  //     console.error(`Error with fetching verse: ${err}`);
  //   }
  // }
}
