'use client';
import * as z from 'zod';
import { createCollection } from '@/actions/createCollection';
import { Button } from '@/component-library/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/component-library/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/component-library/form';
import { Input } from '@/component-library/input';
import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { CollectionSchema } from './schema';
import { useSession } from 'next-auth/react';
import { FormError, FormSuccess } from '@/app/ui/formMessage';

const CollectionsPage = () => {
  const session = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof CollectionSchema>>({
    defaultValues: {
      userId: session.data?.user?.id,
      name: '',
    },
  });
  const collectionName = form.watch('name');

  const handleSubmit = (values: z.infer<typeof CollectionSchema>) => {
    startTransition(() => {
      createCollection(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
    setOpen(false);
  };
  const CreateCollection = () => {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">Add Collection +</Button>
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
  return (
    <div>
      <FormSuccess message={success} />
      <FormError message={error} />
      <h1>CollectionsPage</h1>
      {CreateCollection()}
    </div>
  );
};

export default CollectionsPage;
