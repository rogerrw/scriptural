'use client';
import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { fetchVerse } from '@/actions/fetchVerse';
import { Combobox } from '@/component-library/combobox';
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
import VerseCard from '@/component-library/verse-card';
import { books, translations } from '@/constants/bible';
import { Card } from '@/component-library/card';

const SearchSchema = z.object({
  book: z.string().min(1),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive(),
  translation: z.string().min(1),
});

interface IVerseResult {
  id: string;
  text: string;
}

const SearchPage = () => {
  const [fetchedVerse, setFetchedVerse] = useState<IVerseResult | undefined>();
  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { book: '', translation: 'ESV' },
  });
  const book = form.watch('book');
  const chapterNumber = form.watch('chapter');
  const verseNumber = form.watch('verse');
  const translation = form.watch('translation');

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

  return (
    <div className="fadein flex flex-col gap-4">
      <Card className="flex flex-row justify-center gap-4 border-none bg-gray-900 px-8 py-4">
        <Form {...form}>
          <form className="flex flex-row gap-4">
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
                    placeholder="Select a book"
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
                    <SelectTrigger className="h-10 w-[180px]">
                      <SelectValue placeholder="Translation" />
                    </SelectTrigger>
                    <SelectContent align="end">
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
          </form>
        </Form>
      </Card>
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
    </div>
  );
};

export default SearchPage;
