'use client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  typedWord?: string;
  validationMethod?: 'alphanumeric' | 'exact' | 'first letter';
  wordIndex: number;
  currentWordIndex: number;
  currentLetterIndex: number;
}
interface LetterProps {
  referenceChar: string;
  typedChar?: string;
  wordIndex: number;
  currentWordIndex: number;
  letterIndex: number;
}

const Letter = ({ referenceChar, typedChar, wordIndex, currentWordIndex }: LetterProps) => {
  if (typedChar) {
    if (referenceChar && typedChar === referenceChar) {
      return <div className="text-white">{typedChar}</div>;
    }
    if (referenceChar && typedChar !== referenceChar) {
      return <div className="text-red-400 line-through">{typedChar}</div>;
    }
    if (!referenceChar) {
      return <div className="text-red-400 line-through opacity-50">{typedChar}</div>;
    }
  } else {
    if (wordIndex < currentWordIndex && referenceChar) {
      return <div className="text-red-400 opacity-50">{referenceChar}</div>;
    }
    return <div className="opacity-50">{referenceChar}</div>;
  }
};

const Word = ({ referenceWord, wordIndex, typedWord = '', currentWordIndex }: WordProps) => {
  // TODO: Add different regex matchers for various verse typing validations
  // - alphanumeric only (default)
  // - exact (included)
  // - first letter only

  const alphanumericValidator = /s/i; // generate the validator based on the typedWord
  // check if the validator matches the referenceWord. If it does not, render the word in error color

  const renderLetters = () => {
    if (typedWord.length >= referenceWord.length) {
      return typedWord.split('').map((typedChar, index) => {
        return (
          <Letter
            typedChar={typedChar}
            referenceChar={referenceWord?.[index]}
            letterIndex={index}
            wordIndex={wordIndex}
            currentWordIndex={currentWordIndex}
          />
        );
      });
    }

    return referenceWord.split('').map((referenceChar, index) => {
      return (
        <Letter
          typedChar={typedWord?.[index]}
          referenceChar={referenceChar}
          letterIndex={index}
          wordIndex={wordIndex}
          currentWordIndex={currentWordIndex}
        />
      );
    });
  };

  return <div className="flex">{renderLetters()}</div>;
};

const VerseTyper = ({ verseText, difficulty = 0 }: VerseTyperProps) => {
  const [typedText, setTypedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWordIndex = useMemo(() => {
    return typedText.split(' ').length - 1;
  }, [typedText]);

  const currentLetterIndex = useMemo(() => {
    const typedTextArray = typedText.split(' ');
    const currentWord = typedTextArray.length ? typedTextArray[typedTextArray.length - 1] : '';
    return currentWord.length - 1;
  }, [typedText]);

  /* Reset the input if the reference verse changes */
  useEffect(() => {
    setTypedText('');
  }, [verseText]);

  const verseWords = verseText.split(' ');
  const typedWords = typedText.split(' ');

  const handleComplete = () => {
    // TODO: Trigger review summary
    console.log('Verse complete!');
  };

  const renderText = () => {
    return (
      <div
        id="verse-display"
        className="mx-32 flex flex-wrap gap-8 font-mono text-4xl"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        {verseWords.map((word, index) => {
          return (
            <Word
              referenceWord={word}
              typedWord={typedWords?.[index]}
              wordIndex={index}
              currentWordIndex={currentWordIndex}
              currentLetterIndex={currentLetterIndex}
            />
          );
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
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          switch (e.key) {
            case 'ArrowRight':
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowDown':
              e.preventDefault();
              break;
            default:
              break;
          }
        }}
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
