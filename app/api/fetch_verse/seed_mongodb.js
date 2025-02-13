const fs = require('fs');
const path = require('path');
const os = require('os');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URL);

const booksMapping = {
  '1CH': '1 Chronicles',
  '1CO': '1 Corinthians',
  '1JN': '1 John',
  '1KI': '1 Kings',
  '1PE': '1 Peter',
  '1SA': '1 Samuel',
  '1TH': '1 Thessalonians',
  '1TI': '1 Timothy',
  '2CH': '2 Chronicles',
  '2CO': '2 Corinthians',
  '2JN': '2 John',
  '2KI': '2 Kings',
  '2PE': '2 Peter',
  '2SA': '2 Samuel',
  '2TH': '2 Thessalonians',
  '2TI': '2 Timothy',
  '3JN': '3 John',
  ACT: 'Acts',
  AMO: 'Amos',
  COL: 'Colossians',
  DAN: 'Daniel',
  DEU: 'Deuteronomy',
  ECC: 'Ecclesiastes',
  EPH: 'Ephesians',
  EST: 'Esther',
  EXO: 'Exodus',
  EZK: 'Ezekiel',
  EZR: 'Ezra',
  GAL: 'Galatians',
  GEN: 'Genesis',
  HAB: 'Habakkuk',
  HAG: 'Haggai',
  HEB: 'Hebrews',
  HOS: 'Hosea',
  ISA: 'Isaiah',
  JAS: 'James',
  JDG: 'Judges',
  JER: 'Jeremiah',
  JHN: 'John',
  JOB: 'Job',
  JOL: 'Joel',
  JON: 'Jonah',
  JOS: 'Joshua',
  JUD: 'Jude',
  LAM: 'Lamentations',
  LEV: 'Leviticus',
  LUK: 'Luke',
  MAL: 'Malachi',
  MAT: 'Matthew',
  MIC: 'Micah',
  MRK: 'Mark',
  NAM: 'Nahum',
  NEH: 'Nehemiah',
  NUM: 'Numbers',
  OBA: 'Obadiah',
  PHM: 'Philemon',
  PHP: 'Philippians',
  PRO: 'Proverbs',
  PSA: 'Psalms',
  REV: 'Revelation',
  ROM: 'Romans',
  RUT: 'Ruth',
  SNG: 'Song of Solomon',
  TIT: 'Titus',
  ZEC: 'Zechariah',
  ZEP: 'Zephaniah',
};

function listFiles(dirPaths) {
  const objs = {};
  function readDirSync(currPath) {
    const entries = fs.readdirSync(currPath, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(currPath, entry.name);
      if (entry.isDirectory()) {
        readDirSync(fullPath);
      } else if (entry.isFile()) {
        const fileData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        let parseParentPath = entry.parentPath.split('/');
        let book = parseParentPath.pop();
        book = booksMapping[book];
        let chapters = fileData.text;
        let translation = fileData.version; // ONLY DO ESV, NASB, and KJV
        if (translation === 'ESV' || translation === 'NASB' || translation === 'KJV') {
          if (!objs[book])
            objs[book] = {
              chapters: Array(chapters.length),
            };
          for (let i = 0; i < chapters.length; i++) {
            let chapter = chapters[i];
            let verses = chapter.text;
            let numVerses = Number(verses[verses.length - 1]['ID']);
            if (!objs[book].chapters[i]) {
              let chObjs = {
                id: book + '_' + String(i + 1),
                verses: Array(numVerses),
              };
              objs[book].chapters[i] = chObjs;
            }
            for (let j = 0; j < verses.length; j++) {
              let verse = verses[j];
              let verseId = Number(verse['ID']) - 1; // turn ID to number for index
              let verseText = verse['text'];
              if (!objs[book].chapters[i].verses[verseId]) {
                objs[book].chapters[i].verses[verseId] = {
                  id: book + '_' + String(i + 1) + '_' + verse['ID'],
                };
              }
              if (!objs[book].chapters[i].verses[verseId][translation]) {
                objs[book].chapters[i].verses[verseId] = {
                  ...objs[book].chapters[i].verses[verseId],
                  [translation]: verseText,
                };
              } else {
                objs[book].chapters[i].verses[verseId][translation] += verseText
                  ? ' ' + verseText
                  : '';
              }
            }
          }
        }
      }
    });
  }
  dirPaths.forEach((path) => {
    readDirSync(path);
  });
  fs.writeFileSync('./app/api/mongodb/data.json', JSON.stringify(objs, null, 4), 'utf8');
  return objs;
}

async function seedMongoDb() {
  try {
    // Connect to database
    await client.connect();
    const { databases } = await client.db().admin().listDatabases();
    const dbExist = databases.some((db) => db.name === process.env.MONGO_DATABASE);

    if (!dbExist) {
      console.log('Database does not exist. Creating database...');
      const database = client.db(process.env.MONGO_DATABASE);
      await database.createCollection('bible'); // delete after rerunning
      console.log('Successfully created Bible database!');
    }
    const holybooksData = listFiles([
      `${process.env.HOLYBOOKS_PATHNAME}/EN/OT`,
      `${process.env.HOLYBOOKS_PATHNAME}/EN/NT`,
    ]);

    console.log('Seeding holybooks into MongoDB...');
    for (let [bookName, bookData] of Object.entries(holybooksData)) {
      const database = client.db(process.env.MONGO_DATABASE);
      // check if collection does not exist
      const findCollection = await database.listCollections({ name: bookName }).toArray();
      if (findCollection.length === 0) {
        await database.createCollection(bookName);
      }
      await database.collection(bookName).insertMany(bookData.chapters);
      await database.collection('bible').drop();
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  } finally {
    console.log('Finished seeding MongoDB!');
    await client.close();
  }
}
seedMongoDb();
