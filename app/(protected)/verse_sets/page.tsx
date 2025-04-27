import React from 'react';
import { ScrollArea } from '@/component-library/scroll-area';
import { Card } from '@/component-library/card';
import { Button } from '@/component-library/button';
import { Separator } from '@/component-library/separator';
import { PlusIcon } from 'lucide-react';

const VerseSetsPage = () => {
  const sampleVerseSets = [
    {
      id: 0,
      name: 'All Verses',
    },
    {
      id: 1,
      name: 'Verse Set 1',
    },
    {
      id: 2,
      name: 'Verse Set 2',
    },
    {
      id: 3,
      name: 'Verse Set 3',
    },
  ];

  return (
    <div className="fadein flex flex-row gap-4">
      <Card className="h-full w-80 max-w-80">
        <div className="flex items-center justify-between bg-gray-800 p-4">
          <span className="ml-2 font-bold text-gray-900 dark:text-gray-300">Verse Sets</span>
          <Button
            variant="ghost"
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-full w-full p-2">
          {sampleVerseSets.map((verseSet, index) => (
            <React.Fragment key={verseSet.id}>
              <Button
                className="my-1 w-full text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                variant="ghost"
              >
                {verseSet.name}
              </Button>
              {index !== sampleVerseSets.length - 1 && (
                <Separator className="bg-gray-200 dark:bg-gray-700" />
              )}
            </React.Fragment>
          ))}
        </ScrollArea>
      </Card>
      <div className="w-1/2"></div>
    </div>
  );
};

export default VerseSetsPage;
