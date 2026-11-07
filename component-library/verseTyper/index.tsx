'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../input';
import {
  applyKeystroke,
  charMatches,
  startAttempt,
  type Attempt,
  type FinishedAttempt,
  type Keystroke,
} from '@/lib/typing';

interface VerseTyperProps {
  verseText: string;
  onComplete?: (attempt: FinishedAttempt) => void;
}

const Letter = ({
  referenceChar,
  typedChar,
}: {
  referenceChar: string;
  typedChar?: string;
}) => {
  if (typedChar === undefined) {
    return <div className="opacity-50">{referenceChar}</div>;
  }
  if (charMatches(typedChar, referenceChar)) {
    return <div className="text-white">{typedChar}</div>;
  }
  return <div className="text-red-400 line-through">{typedChar}</div>;
};

function wordCut(typed: string): number {
  let index = typed.length;
  while (index > 0 && typed[index - 1] === ' ') {
    index -= 1;
  }
  while (index > 0 && typed[index - 1] !== ' ') {
    index -= 1;
  }
  return index;
}

function keystrokesFromInput(
  event: InputEvent,
  typed: string,
  t: number,
): readonly Keystroke[] | 'blocked' {
  if (event.inputType === 'insertText' || event.inputType === 'insertCompositionText') {
    const data = event.data ?? '';
    if (data.length === 0) {
      return 'blocked';
    }
    return [...data].map((char) => ({ kind: 'insert' as const, char, t }));
  }
  if (event.inputType === 'deleteContentBackward') {
    return typed.length === 0 ? [] : [{ kind: 'delete', t }];
  }
  if (event.inputType === 'deleteWordBackward') {
    const cut = wordCut(typed);
    return Array.from({ length: typed.length - cut }, () => ({ kind: 'delete' as const, t }));
  }
  return 'blocked';
}

const VerseTyper = ({ verseText, onComplete }: VerseTyperProps) => {
  const [attempt, setAttempt] = useState<Attempt>(() => startAttempt(verseText));
  const inputRef = useRef<HTMLInputElement>(null);
  const onCompleteRef = useRef(onComplete);
  const finishedRef = useRef(false);
  const originRef = useRef<number | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setAttempt(startAttempt(verseText));
    finishedRef.current = false;
    originRef.current = null;
  }, [verseText]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const onBeforeInput = (event: InputEvent) => {
      event.preventDefault();

      setAttempt((current) => {
        const isFirst = current.keystrokes.length === 0;
        if (isFirst) {
          originRef.current = performance.now();
        }
        const t = isFirst || originRef.current === null ? 0 : Math.round(performance.now() - originRef.current);
        const keys = keystrokesFromInput(event, current.typed, t);
        if (keys === 'blocked' || keys.length === 0) {
          if (current.keystrokes.length === 0) {
            originRef.current = null;
          }
          return current;
        }
        let next = current;
        let justFinished: FinishedAttempt | null = null;
        for (const keystroke of keys) {
          const after = applyKeystroke(next, keystroke);
          if (next.status === 'typing' && after.status === 'finished') {
            justFinished = after;
          }
          next = after;
        }
        if (justFinished && !finishedRef.current) {
          finishedRef.current = true;
          const done = justFinished;
          queueMicrotask(() => onCompleteRef.current?.(done));
        }
        return next;
      });
    };

    input.addEventListener('beforeinput', onBeforeInput);
    return () => input.removeEventListener('beforeinput', onBeforeInput);
  }, [verseText]);

  const parts: { kind: 'word' | 'space'; text: string; start: number }[] = [];
  let cursor = 0;
  while (cursor < verseText.length) {
    if (verseText[cursor] === ' ') {
      parts.push({ kind: 'space', text: ' ', start: cursor });
      cursor += 1;
      continue;
    }
    const start = cursor;
    while (cursor < verseText.length && verseText[cursor] !== ' ') {
      cursor += 1;
    }
    parts.push({ kind: 'word', text: verseText.slice(start, cursor), start });
  }

  return (
    <div className="mx-32 flex-grow justify-center">
      <div
        id="verse-display"
        className="flex flex-wrap items-end gap-x-3 gap-y-8 font-mono text-4xl"
        onClick={() => inputRef.current?.focus()}
      >
        {parts.map((part) => {
          if (part.kind === 'space') {
            const typedChar =
              part.start < attempt.typed.length ? attempt.typed[part.start] : undefined;
            return (
              <div key={part.start} className="w-4">
                <Letter referenceChar=" " typedChar={typedChar} />
              </div>
            );
          }
          return (
            <div key={part.start} className="flex">
              {[...part.text].map((referenceChar, offset) => {
                const index = part.start + offset;
                const typedChar = index < attempt.typed.length ? attempt.typed[index] : undefined;
                return (
                  <Letter key={index} referenceChar={referenceChar} typedChar={typedChar} />
                );
              })}
            </div>
          );
        })}
      </div>
      <Input
        ref={inputRef}
        autoFocus
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key.startsWith('Arrow')) {
            event.preventDefault();
          }
        }}
        onPaste={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        onChange={() => undefined}
        value=""
        className="absolute h-0 w-0 opacity-0"
      />
    </div>
  );
};

export default VerseTyper;
