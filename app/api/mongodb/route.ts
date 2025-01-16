import { NextRequest, NextResponse } from 'next/server';
require('dotenv').config();
import clientPromise from '@/lib/mongodb';

type DatabaseNames = {
  name: string;
};

async function fetchVerseTranslations(
  bookName: string,
  chapterNum: number,
  verseNum: number,
  translation: string,
) {
  try {
    const client = await clientPromise;
    const db = await client.db(process.env.MONGODB_DATABASE);
    const { databases } = await client.db().admin().listDatabases({ nameOnly: true });
    const dbExist = databases.some((db: DatabaseNames) => db.name === process.env.MONGODB_DATABASE);
    if (!dbExist) {
      return `Database '${process.env.MONGODB_DATABASE}' does not exist`;
    }

    // check if collection exist
    const verseObj = await db.collection(bookName).findOne({
      verses: { $elemMatch: { id: `${bookName}_${chapterNum}_${verseNum}` } },
    });
    if (!verseObj) {
      return;
    }
    const verseTranslations = verseObj.verses[verseNum - 1]; // return all available translations in 0th index
    if (translation) {
      if (!verseTranslations[translation]) {
        return;
      }
      return {
        id: verseTranslations.id,
        [translation]: verseTranslations[translation],
      };
    }
    return verseTranslations;
  } catch (error) {
    console.error(`Error with fetching verse: ${error}`);
  } finally {
    // await clientPromise.close();
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
