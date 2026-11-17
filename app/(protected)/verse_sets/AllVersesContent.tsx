'use client';

import Link from 'next/link';
import { KeyboardIcon } from 'lucide-react';
import { UserVerse } from '@prisma/client';
import { Button } from '@/component-library/button';
import VerseCard from '@/component-library/verse-card';

const AllVersesContent = ({ verses }: { verses: UserVerse[] }) => {
  return (
    <div className="fadein flex flex-col gap-8 px-12 py-4">
      <h1 className="text-3xl font-bold">All verses</h1>
      <div className="flex flex-row gap-2">
        <Button asChild>
          <Link href="/review" className="flex items-center gap-2">
            <KeyboardIcon className="h-4 w-4" />
            Review
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {verses.map((verse) => (
          <VerseCard
            key={verse.id}
            verseText={verse.verseText}
            book={verse.book}
            chapterNumber={verse.chapter}
            verseNumber={verse.startingVerse}
            translation={verse.translation}
          />
        ))}
      </div>
    </div>
  );
};

export default AllVersesContent;
