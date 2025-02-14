'use server';
import * as z from 'zod';
import prisma from '@/prisma';
import { UserCollection } from '@prisma/client';
import { CollectionSchema } from '@/app/user/collections/schema';

export async function addCollection(params: z.infer<typeof CollectionSchema>) {
  const { userId, name } = params;
  const collectionId = await prisma.collection.create({
    data: {
      name,
    },
    select: {
      id: true, // only return collectionId
    },
  });

  if (!collectionId) {
    return {
      error: 'Unable to create collection',
    };
  }

  const userCollection: UserCollection = await prisma.userCollection.create({
    data: {
      userId,
      collectionId: collectionId.id,
    },
  });
  if (!userCollection) {
    return {
      error: 'Unable to add collection to user',
    };
  }

  return {
    success: 'Collection added',
  };
}
