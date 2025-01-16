'use client';
import React, { useRef, useState } from 'react';
import { Input } from '../input';

interface VerseTyperProps {
  verseText: string;
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
    return <div className="text-slate-600 opacity-0">{referenceChar}</div>;
  }

  if (typedChar.toLowerCase() !== referenceChar.toLowerCase()) {
    return <div className="text-red-400">{typedChar}</div>;
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

const VerseTyper = ({ verseText }: VerseTyperProps) => {
  const [typedText, setTypedText] = useState('');

  const renderText = () => {
    return (
      // Add onfocus and onblur handlers for this div to focus/blur the hidden text input
      <div className="flex justify-evenly">
        {verseText
          .toLowerCase()
          .split(' ')
          .map((word, index) => {
            return <Word referenceWord={word} typedWord={typedText.split(' ')?.[index]} />;
          })}
      </div>
    );
  };

  return (
    <div>
      <Input
        onChange={(e) => {
          setTypedText(e.target.value);
        }}
        value={typedText}
      />
      {verseText}
      {renderText()}
    </div>
  );
};

export default VerseTyper;
