import { fetchVerseSet } from '@/actions/fetchVerseSet';
import { Button } from '@/component-library/button';
import { KeyboardIcon } from 'lucide-react';
import AddVerseDialog from './AddVerseDialog';
import VerseCard from '@/component-library/verse-card';

const VerseSetPage = async ({ params }: { params: { id: string } }) => {
  const verseSet = await fetchVerseSet(params.id);

  if (verseSet.error) {
    return <div>{verseSet.error}</div>;
  }

  const verses = verseSet?.verses;
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
      <div className="flex flex-col gap-4">
        {verses?.map((verse) => (
          <VerseCard
            key={verse.id}
            verseText={verse.userVerse.verseText}
            book={verse.userVerse.book}
            chapterNumber={verse.userVerse.chapter}
            verseNumber={verse.userVerse.startingVerse}
            translation={verse.userVerse.translation}
          />
        ))}
      </div>
    </div>
  );
};

export default VerseSetPage;
console.log();
