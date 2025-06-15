'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { EllipsisIcon, KeyboardIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  return (
    <Card className="border-none bg-transparent text-gray-700 transition-colors dark:text-gray-300 dark:hover:bg-gray-900">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardHeader className="flex flex-row items-center gap-4">
            <CardTitle className="text-md font-bold">
              {book} {chapterNumber}:{verseNumber}
            </CardTitle>
            <CardDescription>{translation}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-center gap-4">
            <div className="text-md">{verseText}</div>
          </CardContent>
        </div>

        {/* Action area */}
        <div className="flex flex-row gap-2 pr-4">
          <Button
            variant="ghost"
            onClick={() => {
              router.push(`/review`);
            }}
          >
            <KeyboardIcon />
          </Button>
          <Button variant="ghost">
            <EllipsisIcon />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VerseCard;
