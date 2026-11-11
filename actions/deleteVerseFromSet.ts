'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import prisma from '@/prisma';

const DeleteVerseFromSetSchema = z.object({
  verseSetVerseId: z.number().int().positive(),
});

export async function deleteVerseFromSet(
  input: z.infer<typeof DeleteVerseFromSetSchema>,
): Promise<{ success: string } | { error: string }> {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const parsed = DeleteVerseFromSetSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid verse' };
  }

  try {
    const membership = await prisma.verseSetVerse.findFirst({
      where: {
        id: parsed.data.verseSetVerseId,
        verseSet: { userId },
      },
      select: { id: true, verseSetId: true },
    });
    if (!membership) {
      return { error: 'Verse not found' };
    }

    const deleted = await prisma.verseSetVerse.deleteMany({
      where: {
        id: membership.id,
        verseSet: { userId },
      },
    });
    if (deleted.count === 0) {
      return { error: 'Verse not found' };
    }

    revalidatePath(`/verse_sets/${membership.verseSetId}`);
    return { success: 'Verse removed from set' };
  } catch (error) {
    console.error('Failed to delete verse from set', error);
    return { error: 'Could not remove this verse from the set' };
  }
}
