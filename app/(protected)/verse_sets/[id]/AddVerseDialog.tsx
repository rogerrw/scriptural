'use client';
import React, { useEffect, useTransition, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/component-library/form';
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
import { FormError } from '@/app/ui/formMessage';
import { books, translations } from '@/constants/bible';

const AddVerseSchema = z.object({
  book: z.string().min(1),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  translation: z.string().min(1),
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
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [fetchedVerse, setFetchedVerse] = useState<IVerseResult | undefined>();
  const form = useForm<z.infer<typeof AddVerseSchema>>({
    resolver: zodResolver(AddVerseSchema),
    defaultValues: {
      book: '',
      chapter: undefined,
      verse: undefined,
      translation: 'ESV',
    },
  });
  const book = form.watch('book');
  const chapterNumber = form.watch('chapter');
  const verseNumber = form.watch('verse');
  const translation = form.watch('translation');

  const handleSubmit = (values: z.infer<typeof AddVerseSchema>) => {
    setError(undefined);
    startTransition(async () => {
      const data = await addVerseToSet({
        book: values.book,
        chapter: values.chapter,
        startingVerse: values.verse,
        translation: values.translation,
        verseSetId,
      });
      if (data?.error) {
        setError(data.error);
        return;
      }
      if (data?.success) {
        toggleDialog(false);
      }
    });
  };

  const resetForm = () => {
    form.reset();
    setFetchedVerse(undefined);
    setError(undefined);
  };

  useEffect(() => {
    if (!book || !chapterNumber || !verseNumber) {
      setFetchedVerse(undefined);
      return;
    }

    fetchVerse(book, chapterNumber, verseNumber, translation)
      .then((data) => {
        setFetchedVerse(data);
      })
      .catch(() => {
        setFetchedVerse(undefined);
      });
  }, [book, chapterNumber, verseNumber, translation]);

  const toggleDialog = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    setOpen(nextOpen);
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-row gap-4 py-4">
              <FormField
                control={form.control}
                name="book"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Book</FormLabel>
                    <Combobox
                      options={books.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Chapter</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-10 dark:bg-background"
                        disabled={isPending}
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const next = event.target.value;
                          field.onChange(next === '' ? undefined : Number(next));
                        }}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="verse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Verse</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-10 dark:bg-background"
                        disabled={isPending}
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const next = event.target.value;
                          field.onChange(next === '' ? undefined : Number(next));
                        }}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="translation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Translation</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 w-[120px]">
                        <SelectValue placeholder="Translation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Translations</SelectLabel>
                          {translations.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
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
            <FormError message={error} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => toggleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!fetchedVerse || isPending}>
                Add Verse
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVerseDialog;
