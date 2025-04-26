import React from 'react';
import { ScrollArea } from '@/component-library/scroll-area';
import { Card } from '@/component-library/card';
import { Button } from '@/component-library/button';
const VerseSetsPage = () => {
  const sampleVerseSets = [
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
      <Card className="w-1/2">
        <ScrollArea>
          {sampleVerseSets.map((verseSet) => (
            <div key={verseSet.id}>
              <Button variant="link">{verseSet.name}</Button>
            </div>
          ))}
        </ScrollArea>
      </Card>
      <div className="w-1/2"></div>
    </div>
  );
};

export default VerseSetsPage;
