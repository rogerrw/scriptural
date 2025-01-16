import { NextRequest, NextResponse } from 'next/server';
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URL);

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
    await client.connect();
    const { databases } = await client.db().admin().listDatabases({ nameOnly: true });
    const dbExist = databases.some((db: DatabaseNames) => db.name === process.env.MONGO_DATABASE);
    if (!dbExist) {
      return `Database '${process.env.MONGO_DATABASE}' does not exist`;
    }

    // check if collection exist
    const db = await client.db(process.env.MONGO_DATABASE);
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
    await client.close();
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
