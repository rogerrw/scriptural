'use client';
import { useSession } from 'next-auth/react';
import { Button } from '@/component-library/button';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
import VerseTyper from '@/component-library/verseTyper';
import React, { useEffect, useState } from 'react';
import { saveVerses } from '../actions/saveVerse';
import { recordAttempt } from '../actions/recordAttempt';
import { FormError, FormSuccess } from './ui/formMessage';
import { UserVerse } from '@prisma/client';
import type { AttemptSummary, FinishedAttempt } from '@/lib/typing';

const DEFAULT_VERSE = {
  book: 'Psalms',
  chapter: 119,
  startingVerse: 105,
  translation: 'ESV',
  text: 'Your word is a lamp to my feet and a light to my path.',
};

const HomePage = () => {
  const [userId, setUserId] = useState<string | undefined>('');
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<number>();
  const [verse, setVerse] = useState<number>();
  const [translation, setTranslation] = useState<string>('');
  const [loadedVerse, setLoadedVerse] = useState(DEFAULT_VERSE);
  const [attemptSummary, setAttemptSummary] = useState<AttemptSummary | null>(null);
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
        const chosenTranslation = translation || 'ESV';
        const text = result[chosenTranslation] ?? result.ESV;
        if (typeof text === 'string' && text.length > 0) {
          setLoadedVerse({
            book,
            chapter,
            startingVerse: verse,
            translation: chosenTranslation,
            text,
          });
          setAttemptSummary(null);
        }
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
      } as UserVerse;
      const res = await saveVerses(values);
      setSuccess(res?.success);
      setError(res?.error);
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
      {attemptSummary ? (
        <div className="mb-8 text-center font-mono" id="attempt-summary">
          <p>Grade {Math.round(attemptSummary.score.grade)}</p>
          <p>Errors {attemptSummary.score.errorCount}</p>
          <p>
            Speed {Math.round(attemptSummary.score.cpm)} characters per minute (
            {Math.round(attemptSummary.wpm)} words per minute)
          </p>
          <p>This translation {Math.round(attemptSummary.translationCpm)} characters per minute</p>
          <p>Mastery {Math.round(attemptSummary.mastery)}</p>
          <p>Overall speed {Math.round(attemptSummary.globalCpm)} characters per minute</p>
        </div>
      ) : null}
      <VerseTyper
        key={loadedVerse.text}
        verseText={loadedVerse.text}
        onComplete={(finished: FinishedAttempt) => {
          void recordAttempt({
            attemptId: crypto.randomUUID(),
            book: loadedVerse.book,
            chapter: loadedVerse.chapter,
            startingVerse: loadedVerse.startingVerse,
            translation: loadedVerse.translation,
            verseText: loadedVerse.text,
            keystrokes: finished.keystrokes.map((keystroke) =>
              keystroke.kind === 'insert'
                ? { kind: 'insert' as const, char: keystroke.char, t: keystroke.t }
                : { kind: 'delete' as const, t: keystroke.t },
            ),
          }).then((result) => {
            if ('error' in result) {
              setError(result.error);
              return;
            }
            setError(undefined);
            setAttemptSummary(result.summary);
          });
        }}
      />
    </div>
  );
};

export default HomePage;
