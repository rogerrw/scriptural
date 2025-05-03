'use client';
import React, { useEffect, useTransition, useState } from 'react';
import { z } from 'zod';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/component-library/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/component-library/dialog';
import { Input } from '@/component-library/input';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
} from '@/component-library/select';
import { Combobox } from '@/component-library/combobox';
import VerseCard from '@/component-library/verse-card';

import { addVerseToSet } from '@/actions/addVerseToSet';
import { fetchVerse } from '@/actions/fetchVerse';
import { books, translations } from '@/constants/bible';
import { Label } from '@/component-library/label';

const AddVerseSchema = z.object({
  book: z.string(),
  chapter: z.number(),
  verse: z.number(),
  translation: z.string().default('ESV'),
});

interface AddVerseDialogProps {
  verseSetId: string;
}

interface IVerseResult {
  id: string;
  text: string;
}

const AddVerseDialog = ({ verseSetId }: AddVerseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [fetchedVerse, setFetchedVerse] = useState<IVerseResult | undefined>();
  const [book, setBook] = useState<string | undefined>();
  const [chapterNumber, setChapterNumber] = useState<number | undefined>();
  const [verseNumber, setVerseNumber] = useState<number | undefined>();
  const [translation, setTranslation] = useState<string>('ESV');

  const handleSubmit = () => {
    startTransition(() => {
      // addVerseToSet({ ...values, verseSetId }).then((data) => {
      //   if (data?.error) {
      //     setError(data.error);
      //   } else if (data?.success) {
      //     setSuccess(data.success);
      //     setOpen(false);
      //     form.reset();
      //   }
      // });
    });
  };

  const resetForm = () => {
    setBook(undefined);
    setChapterNumber(undefined);
    setVerseNumber(undefined);
    setTranslation('ESV');
    setFetchedVerse(undefined);
  };

  useEffect(() => {
    if (!book || !chapterNumber || !verseNumber) {
      setFetchedVerse(undefined);
      return;
    }

    fetchVerse(book, chapterNumber, verseNumber, translation).then((data) => {
      setFetchedVerse(data as IVerseResult);
    });
  }, [book, chapterNumber, verseNumber, translation]);

  const toggleDialog = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <PlusIcon className="h-4 w-4" />
          Add Verses
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl border-none bg-gray-800 text-gray-700 hover:text-gray-900 dark:bg-gray-900 dark:text-gray-300">
        <DialogHeader>
          <DialogTitle>Add Verse</DialogTitle>
          <DialogDescription>Enter the details of the verse you want to add.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-row gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Book</Label>
            <Combobox
              options={books.map((book) => ({
                value: book.value,
                label: book.label,
              }))}
              onChange={(value) => setBook(value)}
              value={book}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Chapter</Label>
            <Input
              type="number"
              className="h-10 dark:bg-background"
              onChange={(e) => setChapterNumber(Number(e.target.value))}
              disabled={isPending}
              value={chapterNumber || ''}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Verse</Label>
            <Input
              type="number"
              className="h-10 dark:bg-background"
              onChange={(e) => setVerseNumber(Number(e.target.value))}
              disabled={isPending}
              value={verseNumber || ''}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs">Translation</Label>
            <Select value={translation} onValueChange={(value) => setTranslation(value)}>
              <SelectTrigger className="h-10 w-[120px]">
                <SelectValue placeholder="Translation" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Translations</SelectLabel>
                  {translations.map((translation) => (
                    <SelectItem key={translation.value} value={translation.value}>
                      {translation.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        {fetchedVerse && (
          <div className="fadein flex flex-col gap-4">
            <VerseCard
              verseText={fetchedVerse.text}
              verseNumber={verseNumber}
              book={book}
              chapterNumber={chapterNumber}
              translation={translation}
            />
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => toggleDialog(false)}>
            Cancel
          </Button>
          <Button disabled={!fetchedVerse} onClick={handleSubmit}>
            Add Verse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVerseDialog;
