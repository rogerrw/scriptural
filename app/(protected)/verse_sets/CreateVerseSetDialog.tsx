'use client';
import React, { useTransition, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/component-library/button';
import { VerseSetSchema } from '@/app/(protected)/verse_sets/schema';
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
import { createVerseSet } from '@/actions/createVerseSet';
import { useSession } from 'next-auth/react';
const CreateVerseSetDialog = () => {
  const session = useSession();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof VerseSetSchema>>({
    defaultValues: {
      userId: session.data?.user?.id,
      name: '',
    },
  });
  const collectionName = form.watch('name');

  const handleSubmit = (values: z.infer<typeof VerseSetSchema>) => {
    startTransition(() => {
      createVerseSet(values).then((data) => {
        console.log(data?.error);
        console.log(data?.success);
      });
    });
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
        >
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
  );
};

export default CreateVerseSetDialog;
