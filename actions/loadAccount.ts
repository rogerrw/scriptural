'use server';

import { auth } from '@/auth';
import prisma from '@/prisma';

export async function loadAccountSettings() {
  const userId = (await auth())?.user?.id;
  if (!userId) {
    throw new Error('Account settings rendered without session.user.id');
  }

  const account = await prisma.user.findUnique({
    where: { id: userId },
    select: { reviewLimit: true, timezone: true },
  });
  if (!account) {
    throw new Error('Account settings rendered without an account');
  }

  return account;
}
