import { ScrollArea } from '@/component-library/scroll-area';
import { Card } from '@/component-library/card';
import { Button } from '@/component-library/button';
import { Separator } from '@/component-library/separator';

import NewVerseSetDialog from './NewVerseSetDialog';

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
      <Card className="box-border h-full w-80 max-w-80 border-none">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <span className="ml-2 font-bold text-gray-900 dark:text-gray-300">Verse Sets</span>
          <NewVerseSetDialog />
        </div>
        <ScrollArea className="h-full w-full rounded-b-lg bg-gray-800 p-2">
          {sampleVerseSets.map((verseSet, index) => (
            <div key={verseSet.id}>
              <Button
                className="my-1 w-full text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                variant="ghost"
              >
                {verseSet.name}
              </Button>
              {index !== sampleVerseSets.length - 1 && (
                <Separator className="bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </ScrollArea>
      </Card>
      <div className="w-1/2"></div>
    </div>
  );
};

export default VerseSetsPage;
