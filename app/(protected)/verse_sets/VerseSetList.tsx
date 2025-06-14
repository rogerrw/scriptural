'use client';
import React from 'react';
import { Button } from '@/component-library/button';
import { ScrollArea } from '@/component-library/scroll-area';
import { Separator } from '@/component-library/separator';
import { VerseSet } from '@prisma/client';
import { useRouter } from 'next/navigation';

const VerseSetList = ({ verseSets }: { verseSets: VerseSet[] }) => {
  const router = useRouter();
  return (
    <ScrollArea className="h-full w-full rounded-b-lg bg-gray-900 p-2">
      {verseSets.map((verseSet, index) => (
        <div key={verseSet.id}>
          <Button
            className="my-1 w-full text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            variant="ghost"
            onClick={() => {
              router.push(`/verse_sets/${verseSet.id}`);
            }}
          >
            {verseSet.name}
          </Button>
          {index !== verseSets.length - 1 && <Separator className="bg-gray-200 dark:bg-gray-800" />}
        </div>
      ))}
    </ScrollArea>
  );
};

export default VerseSetList;
