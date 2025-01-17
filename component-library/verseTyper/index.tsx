'use client';
import React, { useRef, useState } from 'react';
import { Input } from '../input';

interface VerseTyperProps {
  verseText: string;
  /**
   * Difficulty level of the verse being typed. At increasing difficulty levels, more words will be hidden until none of the reference verse shows up. The user will also be awarded more points at higher levels of difficulty
   */
  difficulty?: 0 | 1 | 2 | 3 | 4 | 5;
}

interface WordProps {
  referenceWord: string;
  typedWord: string;
  validationMethod?: 'alphanumeric' | 'exact' | 'first letter';
}
interface LetterProps {
  typedChar: string;
  referenceChar: string;
}

const Letter = ({ referenceChar, typedChar }: LetterProps) => {
  if (!typedChar?.length) {
    return <div className="text-slate-600">{referenceChar}</div>;
  }

  if (typedChar.toLowerCase() !== referenceChar.toLowerCase()) {
    return <div className="text-red-400 line-through">{typedChar}</div>;
  }
  return <div className="text-white">{typedChar}</div>;
};

const Word = ({ referenceWord, typedWord, validationMethod = 'alphanumeric' }: WordProps) => {
  // TODO: Add different regex matchers for various verse typing validations
  // - alphanumeric only (default)
  // - exact (included)
  // - first letter only

  const alphanumericValidator = /s/i; // generate the validator based on the typedWord
  // check if the validator matches the referenceWord. If it does not, render the word in error color

  return (
    <div className="flex">
      {referenceWord.split('').map((char, index) => {
        return <Letter typedChar={typedWord?.[index]} referenceChar={char} />;
      })}
    </div>
  );
};

const VerseTyper = ({ verseText, difficulty = 0 }: VerseTyperProps) => {
  const [typedText, setTypedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const verseWords = verseText.split(' ');
  const typedWords = typedText.split(' ');

  const handleComplete = () => {
    // TODO: Trigger review summary
    console.log('Verse complete!');
  };

  const renderText = () => {
    return (
      // Add onfocus and onblur handlers for this div to focus/blur the hidden text input
      <div
        id="verse-display"
        className="mx-32 flex flex-wrap gap-8 font-mono text-4xl"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        {verseWords.map((word, index) => {
          return <Word referenceWord={word} typedWord={typedText.split(' ')?.[index]} />;
        })}
      </div>
    );
  };

  return (
    <div>
      {renderText()}
      <Input
        ref={inputRef}
        autoFocus
        onChange={(e) => {
          const newlyTypedText = e.target.value;
          setTypedText(newlyTypedText);

          // check if complete
          const newlyTypedWords = newlyTypedText.toLowerCase().split(' ');
          const finalTypedWord = newlyTypedWords[verseWords.length - 1];
          const finalVerseWord = verseWords[verseWords.length - 1];
          const isComplete =
            newlyTypedWords.length === verseWords.length && finalTypedWord === finalVerseWord;

          if (isComplete) {
            handleComplete();
          }
        }}
        value={typedText}
        className="absolute h-0 w-0 opacity-0"
      />
    </div>
  );
};

export default VerseTyper;
