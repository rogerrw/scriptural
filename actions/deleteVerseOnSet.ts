'use server';
import prisma from '@/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const DeleteVerseSchema = z.object({
  id: z.number(),
});

export async function deleteVerseOnSet(params: z.infer<typeof DeleteVerseSchema>) {
  const session = await auth();
  const { id } = params;
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }
  try {
    await prisma.verseSetVerse.delete({
      where: {
        id: id,
      },
    });
    return {
      success: 'Deleted verse on set successfully',
    };
  } catch (error) {
    return {
      error: `Failed to delete verse on set: ${error}`,
    };
  }
}
