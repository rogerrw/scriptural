'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
interface VerseCardProps {
  verseText: string;
  verseNumber?: number;
  book?: string;
  chapterNumber?: number;
  translation?: string;
}

const VerseCard = ({
  verseText,
  verseNumber,
  book,
  chapterNumber,
  translation,
}: VerseCardProps) => {
  return (
    <Card className="border-none bg-transparent">
      <CardHeader className="flex flex-row items-center gap-4">
        <CardTitle className="text-md font-bold">
          {book} {chapterNumber}:{verseNumber}
        </CardTitle>
        <CardDescription>{translation}</CardDescription>
      </CardHeader>
      <CardContent>{verseText}</CardContent>
    </Card>
  );
};

export default VerseCard;
