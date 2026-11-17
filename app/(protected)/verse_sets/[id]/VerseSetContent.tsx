'use client';

import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/component-library/button';
import { KeyboardIcon } from 'lucide-react';
import VerseCard from '@/component-library/verse-card';
import AddVerseDialog from './AddVerseDialog';
import DeleteVerseFromSetButton from './DeleteVerseFromSetButton';

type VerseSetWithVerses = Prisma.VerseSetGetPayload<{
  include: { verses: { include: { userVerse: true } } };
}>;

type VerseSetContentProps = {
  verseSetId: string;
  verseSet: VerseSetWithVerses;
};

const VerseSetContent = ({ verseSetId, verseSet }: VerseSetContentProps) => {
  return (
    <div className="fadein flex flex-col gap-8 px-12 py-4">
      <h1 className="text-3xl font-bold">{verseSet.name}</h1>
      <div className="flex flex-row gap-2">
        <Button asChild>
          <Link
            href={`/review?set=${encodeURIComponent(verseSet.name)}`}
            className="flex items-center gap-2"
          >
            <KeyboardIcon className="h-4 w-4" />
            Review
          </Link>
        </Button>
        <AddVerseDialog verseSetId={verseSetId} />
      </div>
      <div className="flex flex-col gap-4">
        {verseSet.verses.map((verse) => (
          <VerseCard
            key={verse.id}
            verseText={verse.userVerse.verseText}
            book={verse.userVerse.book}
            chapterNumber={verse.userVerse.chapter}
            verseNumber={verse.userVerse.startingVerse}
            translation={verse.userVerse.translation}
            reviewHref={`/review?setId=${verseSetId}&startId=${verse.userVerse.id}`}
            actions={<DeleteVerseFromSetButton verseSetVerseId={verse.id} />}
          />
        ))}
      </div>
    </div>
  );
};

export default VerseSetContent;
