import { NextRequest, NextResponse } from 'next/server';
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URL);

type DatabaseNames = {
  name: string;
};

async function fetchVerse(
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
      id: `${bookName}_${chapterNum}`,
      verses: { $elemMatch: { id: `${bookName}_${chapterNum}_${verseNum}` } },
    });
    const verseText = verseObj.verses[verseNum];
    if (translation) {
      return {
        id: verseText.id,
        [translation]: verseText[translation],
      };
    }
    return verseText;
  } catch (error) {
    return `Error with fetching verse: ${error}`;
  } finally {
    await client.close();
  }
}

async function handler(req: NextRequest) {
  if (req.method === 'GET') {
    const searchParams = req.nextUrl.searchParams;
    const bookName = searchParams.get('book');
    const chapterNum = Number(searchParams.get('chapter'));
    const verseNum = Number(searchParams.get('verse')) - 1; // 0th index
    const translation = searchParams.get('translation');
    if (!bookName || !chapterNum || !verseNum) {
      return NextResponse.json('Required parameters: book, chapter, verse');
    }

    const res = await fetchVerse(
      bookName as string,
      chapterNum as number,
      verseNum as number,
      translation as string,
    );
    return NextResponse.json(res);
  }
}
export { handler as GET, handler as POST };
