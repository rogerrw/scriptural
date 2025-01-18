'use client';
import { Button } from '@/component-library/button';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
import React, { useState } from 'react';

const HomePage = () => {
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<string>('');
  const [verse, setVerse] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [fetchedVerse, setFetchedVerse] = useState<string>('');

  async function fetchVerse() {
    if (book && chapter && verse) {
      let url = `/api/fetch_verse?book=${book}&chapter=${chapter}&verse=${verse}`;
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
    <div className="flex flex-col">
      <div id="fetch-verse-form" className="flex justify-center gap-4">
        <div>
          <Label>Book</Label>
          <Input
            value={book}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setBook(e.target.value);
            }}
          />
        </div>
        <div>
          <Label>Chapter</Label>
          <Input
            value={chapter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setChapter(e.target.value);
            }}
          />
        </div>
        <div>
          <Label>Verse</Label>
          <Input
            value={verse}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setVerse(e.target.value);
            }}
          />
        </div>
        <div>
          <Label>Translation</Label>
          <Input
            value={translation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTranslation(e.target.value);
            }}
          />
        </div>
        <Button className="self-end" onClick={fetchVerse} disabled={!book || !chapter || !verse}>
          Submit
        </Button>
      </div>
      <p className="p-2">{fetchedVerse}</p>
    </div>
  );
};

export default HomePage;
