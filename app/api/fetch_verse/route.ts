import { NextRequest, NextResponse } from 'next/server';
require('dotenv').config();
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { Books, Verse } from '@/model/Book.schema';
import BookSchema from '@/model/Book.schema';

async function fetchVerseTranslations(
  bookName: string,
  chapterNum: number,
  verseNum: number,
  translation: string,
) {
  try {
    await dbConnect();
    const model = mongoose.model<Books>('Book', BookSchema, bookName);
    const verseObj = await model.findOne(
      { id: `${bookName}_${chapterNum}` },
      { verses: { $elemMatch: { id: `${bookName}_${chapterNum}_${verseNum}` } } },
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
    return verseTranslations;
  } catch (error) {
    console.error(`Error with fetching verse: ${error}`);
  } finally {
    delete (mongoose.connection.models as any)['Book'];
  }
}

async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const searchParams = req.nextUrl.searchParams;
    const bookName = searchParams.get('book');
    const chapterNum = Number(searchParams.get('chapter'));
    const verseNum = Number(searchParams.get('verse'));
    const translation = searchParams.get('translation');
    if (!bookName || !chapterNum || !verseNum) {
      return NextResponse.json('Required parameters: book, chapter, verse', { status: 500 });
    }

    const res = await fetchVerseTranslations(
      bookName as string,
      chapterNum as number,
      verseNum as number,
      translation as string,
    );
    if (!res) {
      return NextResponse.json({ error: 'Invalid verse' }, { status: 500 });
    } else {
      return NextResponse.json(res, { status: 200 });
    }
  }
}
export { handler as GET, handler as POST };
