'use client';

import { useState, useTransition } from 'react';
import { TrashIcon } from 'lucide-react';
import { Button } from '@/component-library/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/component-library/dialog';
import { FormError } from '@/app/ui/formMessage';
import { deleteVerseFromSet } from '@/actions/deleteVerseFromSet';

const DeleteVerseFromSetButton = ({ verseSetVerseId }: { verseSetVerseId: number }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const closeDialog = () => {
    setError(undefined);
    setOpen(false);
  };

  const handleDelete = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteVerseFromSet({ verseSetVerseId });
      if ('error' in result) {
        setError(result.error);
        return;
      }
      closeDialog();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        aria-label="Remove verse from set"
        onClick={() => setOpen(true)}
      >
        <TrashIcon />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            closeDialog();
            return;
          }
          setOpen(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from set</DialogTitle>
            <DialogDescription>
              This removes the verse from the set.
            </DialogDescription>
          </DialogHeader>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteVerseFromSetButton;
