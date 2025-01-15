'use client';
import React, { useState } from 'react';

const HomePage = () => {
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<string>('');
  const [verse, setVerse] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [fetchedVerse, setFetchedVerse] = useState<string>('');

  function getFetchedVerse() {
    if (book && chapter && verse && translation) {
      // TODO fetch verse with server side render
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
          <br />
          <button onSubmit={getFetchedVerse} className="rounded-md bg-gray-800 p-4 text-white">
            Submit
          </button>
        </div>
      </div>
      <p>{fetchedVerse}</p>
    </div>
  );
};

export default HomePage;
