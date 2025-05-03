'use server';
import { Card } from '@/component-library/card';

import NewVerseSetDialog from './CreateVerseSetDialog';
import { fetchVerseSets } from '@/actions/fetchVerseSets';
import VerseSetList from './VerseSetList';
import { auth } from '@/auth';

const VerseSetsLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return <div>Loading...</div>;
  }

  const verseSets = await fetchVerseSets(userId);

  return (
    <div className="fadein flex flex-row justify-center gap-8">
      <Card className="box-border h-full w-80 max-w-80 border-none">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <span className="ml-2 font-bold text-gray-900 dark:text-gray-300">Verse Sets</span>
          <NewVerseSetDialog />
        </div>
        <VerseSetList verseSets={verseSets} />
      </Card>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default VerseSetsLayout;
