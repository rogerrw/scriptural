'use client';
import { useSession } from 'next-auth/react';
import { Button } from '@/component-library/button';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
import VerseTyper from '@/component-library/verseTyper';
import React, { useEffect, useState } from 'react';
import { UserVerseSchema } from './schemas/userverse_schema';
import { saveVerses } from '../actions/save_verse';
import { FormError, FormSuccess } from './ui/formMessage';
const HomePage = () => {
  const [userId, setUserId] = useState<string | undefined>('');
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<number>();
  const [verse, setVerse] = useState<number>();
  const [translation, setTranslation] = useState<string>('');
  const [fetchedVerse, setFetchedVerse] = useState<string>(
    'Your word is a lamp to my feet and a light to my path.', // TODO: fetch random or default verse to save
  );
  async function fetchVerse() {
    if (book && chapter && verse) {
      let url = `/api/fetch_verse?book=${book}&chapter=${chapter}&verse=${verse}`;
      if (translation) {
        url += `&translation=${translation}`;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Invalid verse');
        }

        const result = await res.json();
        setFetchedVerse(translation ? result[translation] : result['ESV']);
      } catch (err) {}
    }
  }
  async function saveVerse() {
    if (userId && book && chapter && verse) {
      const values = {
        userId: userId,
        book: book,
        chapter: chapter,
        startingVerse: verse,
      };
      const validation = UserVerseSchema.safeParse(values);
      if (!validation.success) {
        console.error(`Validation error: ${validation.error}`);
      } else {
        const res = await saveVerses(validation.data);
        setSuccess(res?.success);
        setError(res?.error);
      }
    }
  }
  useEffect(() => {
    if (session) {
      setUserId(session.data?.user?.id);
    }
  }, []);

  return (
    <div className="fadein flex flex-col items-center">
      <FormError message={error} />
      <FormSuccess message={success} />
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
              setChapter(Number(e.target.value));
            }}
          />
        </div>
        <div>
          <Label>Verse</Label>
          <Input
            value={verse}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setVerse(Number(e.target.value));
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
      {userId ? (
        <div className="p-5">
          <Button onClick={saveVerse} disabled={!book || !chapter || !verse}>
            Save Verse
          </Button>
        </div>
      ) : (
        <></>
      )}
      <VerseTyper verseText={fetchedVerse} />
    </div>
  );
};

export default HomePage;
