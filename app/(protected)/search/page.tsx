'use client';
import React, { useEffect, useState, useTransition } from 'react';

import { fetchVerse } from '@/actions/fetchVerse';
import { Combobox } from '@/component-library/combobox';
import { Input } from '@/component-library/input';
import { Label } from '@/component-library/label';
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

interface IVerseResult {
  id: string;
  text: string;
}

const SearchPage = () => {
  const [book, setBook] = useState<string | undefined>();
  const [chapterNumber, setChapterNumber] = useState<number | undefined>();
  const [verseNumber, setVerseNumber] = useState<number | undefined>();
  const [translation, setTranslation] = useState<string>('ESV');
  const [fetchedVerse, setFetchedVerse] = useState<IVerseResult | undefined>();
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!book || !chapterNumber || !verseNumber) {
      setFetchedVerse(undefined);
      return;
    }

    fetchVerse(book, chapterNumber, verseNumber, translation).then((data) => {
      setFetchedVerse(data as IVerseResult);
    });
  }, [book, chapterNumber, verseNumber, translation]);
  return (
    <div className="fadein">
      <Card className="flex flex-row gap-4 border-none bg-gray-900 px-8 py-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Book</Label>
          <Combobox
            options={books.map((book) => ({
              value: book.value,
              label: book.label,
            }))}
            onChange={(value) => setBook(value)}
            placeholder="Select a book"
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
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Translation" />
            </SelectTrigger>
            <SelectContent align="end">
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
