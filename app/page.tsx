'use client';
import React, { useState } from 'react';

const HomePage = () => {
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<string>('');
  const [verse, setVerse] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [fetchedVerse, setFetchedVerse] = useState<string>('');

  async function getFetchedVerse() {
    if (book && chapter && verse) {
      var url = `/api/fetch_verse?book=${book}&chapter=${chapter}&verse=${verse}`;
      if (translation) {
        url += `&translation=${translation}`;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) {
          setFetchedVerse('Invalid verse');
          throw new Error('Invalid verse');
        } else {
          const result = await res.json();
          setFetchedVerse(translation ? result[translation] : result['ESV']);
        }
      } catch (err) {}
    }
  }

  return (
    <div className="">
      <h1>HomePage</h1>
      <div className="mx-2">
        <h2>Fetch a verse!</h2>
        <div id="fetch-verse-form" className="mx-2">
          <div>
            <h5>Book</h5>
            <input
              value={book}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setBook(e.target.value);
              }}
            />
          </div>
          <div>
            <h5>Chapter</h5>
            <input
              value={chapter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setChapter(e.target.value);
              }}
            />
          </div>{' '}
          <div>
            <h5>Verse</h5>
            <input
              value={verse}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setVerse(e.target.value);
              }}
            />
          </div>{' '}
          <div>
            <h5>Translation</h5>
            <input
              value={translation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTranslation(e.target.value);
              }}
            />
          </div>
          <button
            onClick={getFetchedVerse}
            disabled={!book || !chapter || !verse ? true : false}
            className={
              !book || !chapter || !verse
                ? 'mt-5 rounded-md bg-gray-300 p-4 text-white'
                : 'mt-5 rounded-md bg-blue-500 p-4 text-white'
            }
          >
            Submit
          </button>
        </div>
      </div>
      <p className="p-2">{fetchedVerse}</p>
    </div>
  );
};

export default HomePage;
