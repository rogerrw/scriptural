'use client';
import React, { useTransition, useState } from 'react';
import { Button } from '@/component-library/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/component-library/dialog';
import { deleteVerseOnSet } from '@/actions/deleteVerseOnSet';

interface DeleteVerseDialogProps {
  verseId: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteVerseDialog = ({ verseId, open, setOpen }: DeleteVerseDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const data = await deleteVerseOnSet({
        id: verseId,
      });
      if (data?.error) {
        console.error(data.error);
      } else if (data?.success) {
        console.log(data.success);
        toggleDialog(false);
      }
    });
  };
  const toggleDialog = (open: boolean) => {
    if (!open) {
      setOpen(false);
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={toggleDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Verse</DialogTitle>
          <DialogDescription>Are you sure you want to delete this verse?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => toggleDialog(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleSubmit}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVerseDialog;
