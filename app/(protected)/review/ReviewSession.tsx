'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { endReviewSession } from '@/actions/endReviewSession';
import { recordAttempt } from '@/actions/recordAttempt';
import { FormError } from '@/app/ui/formMessage';
import { Button } from '@/component-library/button';
import VerseTyper, { VerseTypedText } from '@/component-library/verseTyper';
import type { FinishedVerse, ReviewSessionVerse } from '@/lib/reviewSession';
import type { AttemptSummary, FinishedAttempt } from '@/lib/typing';

type Stage =
  | { kind: 'typing' }
  | { kind: 'summary'; summary: AttemptSummary; typed: string }
  | { kind: 'ended' };

type ReviewSessionProps = {
  sessionId: string;
  startIndex: number;
  verses: readonly ReviewSessionVerse[];
  finished: readonly FinishedVerse[];
};

function mean(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function queueKey(verses: readonly ReviewSessionVerse[]): string {
  return verses.map((verse) => verse.reviewId ?? verse.id).join(',');
}

const ReviewSession = ({ sessionId, startIndex, verses, finished: opening }: ReviewSessionProps) => {
  const queue = queueKey(verses);
  const [seenQueue, setSeenQueue] = useState(queue);
  const [index, setIndex] = useState(startIndex);
  const [stage, setStage] = useState<Stage>(() =>
    startIndex >= verses.length ? { kind: 'ended' } : { kind: 'typing' },
  );
  const [finished, setFinished] = useState<readonly FinishedVerse[]>(opening);
  const [error, setError] = useState<string | undefined>();
  let position = index;
  let view = stage;
  let shownFinished = finished;
  if (seenQueue !== queue) {
    position = startIndex;
    view = startIndex >= verses.length ? { kind: 'ended' } : { kind: 'typing' };
    shownFinished = opening;
    setSeenQueue(queue);
    setIndex(startIndex);
    setStage(view);
    setFinished(opening);
    setError(undefined);
  }

  useEffect(() => {
    if (view.kind === 'ended') {
      void endReviewSession(sessionId);
    }
  }, [view.kind, sessionId]);

  if (view.kind === 'ended') {
    return (
      <div
        id="review-session-summary"
        className="fadein flex min-h-[70vh] w-full flex-col items-center gap-8 py-8"
      >
        <div className="space-y-2 text-center font-mono">
          <p>
            {shownFinished.length} {shownFinished.length === 1 ? 'verse' : 'verses'} finished
          </p>
          <p>Average grade {Math.round(mean(shownFinished.map((verse) => verse.grade)))}</p>
          <p>
            {Math.round(mean(shownFinished.map((verse) => verse.wpm)))} words per minute for this review
            session
          </p>
        </div>
        <details className="font-mono text-sm">
          <summary className="cursor-pointer">Verses in this review session</summary>
          <ul className="mt-4 space-y-2">
            {shownFinished.map((verse, index) => (
              <li key={verse.reviewId ?? index}>
                {verse.reference} {verse.translation}, grade {Math.round(verse.grade)}, difficulty{' '}
                {verse.difficulty}, {Math.round(verse.wpm)} words per minute
              </li>
            ))}
          </ul>
        </details>
        <Link href="/" className="mt-auto underline">
          Back to home
        </Link>
      </div>
    );
  }

  const verse = verses[position] ?? verses[0];
  if (!verse) {
    return null;
  }

  if (view.kind === 'summary') {
    return (
      <div
        id="attempt-summary"
        className="fadein flex min-h-[70vh] w-full flex-col items-center gap-10 py-8"
      >
        <div className="space-y-2 text-center font-mono">
          <p>
            {verse.reference} {verse.translation}
          </p>
          <p>Grade {Math.round(stage.summary.score.grade)}</p>
          <p>Errors {stage.summary.score.errorCount}</p>
          <p>
            Speed {Math.round(stage.summary.score.cpm)} characters per minute (
            {Math.round(stage.summary.wpm)} words per minute)
          </p>
          <p>This translation {Math.round(stage.summary.translationCpm)} characters per minute</p>
          <p>Mastery {Math.round(stage.summary.mastery)}</p>
          <p>Overall speed {Math.round(stage.summary.globalCpm)} characters per minute</p>
        </div>
        <VerseTypedText verseText={verse.verseText} typed={stage.typed} />
        <Button
          className="mt-auto"
          onClick={() => {
            if (position + 1 < verses.length) {
              setIndex(position + 1);
              setStage({ kind: 'typing' });
              return;
            }
            setStage({ kind: 'ended' });
          }}
        >
          Next
        </Button>
      </div>
    );
  }

  return (
    <div className="fadein flex flex-col items-center gap-8 py-8">
      <FormError message={error} />
      <p className="font-mono">
        {verse.reference} {verse.translation} ({position + 1} of {verses.length})
      </p>
      <VerseTyper
        key={verse.reviewId ?? verse.id}
        verseText={verse.verseText}
        onComplete={(attempt: FinishedAttempt) => {
          void recordAttempt({
            attemptId: crypto.randomUUID(),
            book: verse.book,
            chapter: verse.chapter,
            startingVerse: verse.startingVerse,
            translation: verse.translation,
            verseText: verse.verseText,
            keystrokes: attempt.keystrokes.map((keystroke) =>
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
            setFinished((current) => [
              ...current,
              {
                id: verse.id,
                reviewId: verse.reviewId,
                reference: verse.reference,
                translation: verse.translation,
                grade: result.summary.score.grade,
                difficulty: result.summary.score.difficulty,
                wpm: result.summary.wpm,
              },
            ]);
            setStage({ kind: 'summary', summary: result.summary, typed: attempt.typed });
          });
        }}
      />
    </div>
  );
};

export default ReviewSession;
