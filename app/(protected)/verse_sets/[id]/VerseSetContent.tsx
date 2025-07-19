'use client';
import { Button } from '@/component-library/button';
import { KeyboardIcon } from 'lucide-react';
import AddVerseDialog from './AddVerseDialog';
import DeleteVerseDialog from './DeleteVerseDialog';
import VerseCard from '@/component-library/verse-card';
import { useState } from 'react';

type VerseSetContentProps = {
  params: any;
  verses: any;
  verseSet: any;
};

const VerseSetContent = ({ params, verses, verseSet }: VerseSetContentProps) => {
  const [verseId, setVerseId] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  return (
    <div className="fadein flex flex-col gap-8 px-12 py-4">
      <h1 className="text-3xl font-bold">{verseSet?.name}</h1>
      <div className="flex flex-row gap-2">
        <Button>
          <KeyboardIcon className="h-4 w-4" />
          Review
        </Button>
        <AddVerseDialog verseSetId={params.id} />
        <DeleteVerseDialog
          verseId={verseId}
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
        />
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
            verseId={verse.id}
            setVerseId={setVerseId}
            openDeleteDialog={openDeleteDialog}
            setOpenDeleteDialog={setOpenDeleteDialog}
          />
        ))}
      </div>
    </div>
  );
};

export default VerseSetContent;
