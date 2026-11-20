'use client';
import React from 'react';
import { Button } from '@/component-library/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/component-library/scroll-area';
import { Separator } from '@/component-library/separator';
import { VerseSet } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';

const itemClass =
  'my-1 w-full justify-start text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
const selectedClass = 'bg-gray-800 text-gray-100 dark:bg-gray-800 dark:text-gray-100';

const VerseSetList = ({ verseSets }: { verseSets: VerseSet[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const allSelected = pathname === '/verse_sets';

  return (
    <ScrollArea className="h-full w-full rounded-b-lg bg-gray-900 p-2">
      <Button
        className={cn(itemClass, allSelected && selectedClass)}
        variant="ghost"
        onClick={() => {
          router.push('/verse_sets');
        }}
      >
        All verses
      </Button>
      {verseSets.length > 0 && <Separator className="bg-gray-200 dark:bg-gray-800" />}
      {verseSets.map((verseSet, index) => {
        const selected = pathname === `/verse_sets/${verseSet.id}`;
        return (
          <div key={verseSet.id}>
            <Button
              className={cn(itemClass, selected && selectedClass)}
              variant="ghost"
              onClick={() => {
                router.push(`/verse_sets/${verseSet.id}`);
              }}
            >
              {verseSet.name}
            </Button>
            {index !== verseSets.length - 1 && (
              <Separator className="bg-gray-200 dark:bg-gray-800" />
            )}
          </div>
        );
      })}
    </ScrollArea>
  );
};

export default VerseSetList;
