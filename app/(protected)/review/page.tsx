'use client';
import { useSession } from 'next-auth/react';
import { Button } from '@/component-library/button';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
import VerseTyper, { VerseTypedText } from '@/component-library/verseTyper';
import React, { useEffect, useState } from 'react';
import { saveVerses } from '@/actions/saveVerse';
import { recordAttempt } from '@/actions/recordAttempt';
import { FormError, FormSuccess } from '@/app/ui/formMessage';
import type { AttemptSummary, FinishedAttempt } from '@/lib/typing';

const DEFAULT_VERSE = {
  book: 'Psalms',
  chapter: 119,
  startingVerse: 105,
  translation: 'ESV',
  text: 'Your word is a lamp to my feet and a light to my path.',
};

const ReviewPage = () => {
  const [userId, setUserId] = useState<string | undefined>('');
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [book, setBook] = useState<string>('');
  const [chapter, setChapter] = useState<number>();
  const [verse, setVerse] = useState<number>();
  const [translation, setTranslation] = useState<string>('');
  const [loadedVerse, setLoadedVerse] = useState(DEFAULT_VERSE);
  const [attemptKey, setAttemptKey] = useState(0);
  const [completed, setCompleted] = useState<{ summary: AttemptSummary; typed: string } | null>(
    null,
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
          setCompleted(null);
        }
      } catch (err) {}
    }
  }
  async function saveVerse() {
    if (userId && book && chapter && verse) {
      const res = await saveVerses({
        userId,
        book,
        chapter,
        startingVerse: verse,
        translation: translation || 'ESV',
      });
      setSuccess(res?.success);
      setError(res?.error);
    }
  }
  useEffect(() => {
    if (session) {
      setUserId(session.data?.user?.id);
    }
  }, []);

  if (completed) {
    return (
      <div
        id="attempt-summary"
        className="fadein flex min-h-[70vh] w-full flex-col items-center gap-10 py-8"
      >
        <div className="space-y-2 text-center font-mono">
          <p>
            {loadedVerse.book} {loadedVerse.chapter}:{loadedVerse.startingVerse}{' '}
            {loadedVerse.translation}
          </p>
          <p>Grade {Math.round(completed.summary.score.grade)}</p>
          <p>Errors {completed.summary.score.errorCount}</p>
          <p>
            Speed {Math.round(completed.summary.score.cpm)} characters per minute (
            {Math.round(completed.summary.wpm)} words per minute)
          </p>
          <p>
            This translation {Math.round(completed.summary.translationCpm)} characters per minute
          </p>
          <p>Mastery {Math.round(completed.summary.mastery)}</p>
          <p>Overall speed {Math.round(completed.summary.globalCpm)} characters per minute</p>
        </div>
        <VerseTypedText verseText={loadedVerse.text} typed={completed.typed} />
        <Button
          className="mt-auto"
          onClick={() => {
            setCompleted(null);
            setAttemptKey((key) => key + 1);
          }}
        >
          Next
        </Button>
      </div>
    );
  }

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
      <VerseTyper
        key={`${loadedVerse.text}:${attemptKey}`}
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
            setCompleted({ summary: result.summary, typed: finished.typed });
          });
        }}
      />
    </div>
  );
};

export default ReviewPage;
