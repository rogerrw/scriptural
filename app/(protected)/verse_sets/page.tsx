'use client';
import React, { useState, useTransition } from 'react';
import { ScrollArea } from '@/component-library/scroll-area';
import { Card } from '@/component-library/card';
import { Button } from '@/component-library/button';
import { Separator } from '@/component-library/separator';
import { PlusIcon } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { CollectionSchema } from '@/app/(protected)/verse_sets/schema';
import { useSession } from 'next-auth/react';
import { createVerseSet } from '@/actions/createVerseSet';
import { z } from 'zod';

const VerseSetsPage = () => {
  const session = useSession();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);
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
  const form = useForm<z.infer<typeof CollectionSchema>>({
    defaultValues: {
      userId: session.data?.user?.id,
      name: '',
    },
  });

  const collectionName = form.watch('name');

  const handleSubmit = (values: z.infer<typeof CollectionSchema>) => {
    startTransition(() => {
      createVerseSet(values).then((data) => {
        console.log(data?.error);
        console.log(data?.success);
      });
    });
    setOpen(false);
  };

  return (
    <div className="fadein flex flex-row gap-4">
      <Card className="box-border h-full w-80 max-w-80 border-none">
        <div className="flex items-center justify-between rounded-t-lg bg-gray-700 p-4">
          <span className="ml-2 font-bold text-gray-900 dark:text-gray-300">Verse Sets</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {/* <Button className="mt-4">Add Collection +</Button> */}
                <PlusIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Create Collection</DialogTitle>
                    <DialogDescription>Give a name to your new collection.</DialogDescription>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Collection Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isPending} id="name" />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </DialogHeader>
                  <DialogFooter>
                    <Button type="submit" disabled={!collectionName} className="mt-4">
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-full w-full rounded-b-lg bg-gray-800 p-2">
          {sampleVerseSets.map((verseSet, index) => (
            <React.Fragment key={verseSet.id}>
              <Button
                className="my-1 w-full text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                variant="ghost"
              >
                {verseSet.name}
              </Button>
              {index !== sampleVerseSets.length - 1 && (
                <Separator className="bg-gray-200 dark:bg-gray-700" />
              )}
            </React.Fragment>
          ))}
        </ScrollArea>
      </Card>
      <div className="w-1/2"></div>
    </div>
  );
};

export default VerseSetsPage;
