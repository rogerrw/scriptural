import { fetchVerseSet } from '@/actions/fetchVerseSet';
import { Button } from '@/component-library/button';
import { KeyboardIcon } from 'lucide-react';
import AddVerseDialog from './AddVerseDialog';

const VerseSetPage = async ({ params }: { params: { id: string } }) => {
  const verseSet = await fetchVerseSet(params.id);
  return (
    <div className="fadein flex flex-col gap-8 px-12 py-4">
      <h1 className="text-3xl font-bold">{verseSet?.name}</h1>
      <div className="flex flex-row gap-2">
        <Button>
          <KeyboardIcon className="h-4 w-4" />
          Review
        </Button>
        <AddVerseDialog verseSetId={params.id} />
      </div>
    </div>
  );
};

export default VerseSetPage;
console.log();
