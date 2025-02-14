'use server';
import * as z from 'zod';
import prisma from '@/prisma';
import { Collection } from '@prisma/client';
import { CollectionSchema } from '@/app/user/collections/schema';

export async function addCollection(params: z.infer<typeof CollectionSchema>) {
  const { userId, name } = params;
  const collection = await prisma.collection.create({
    data: {
      name,
    },
  });

  if (collection) {
    await prisma.userCollection.create({
      data: {
        userId,
        collectionId: collection.id,
      },
    });
  }

  return {
    success: 'Collection added',
  };
}
