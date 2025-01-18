'use server';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma';
import { RegisterSchema } from '@/app/auth/register/schema';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingEmail = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmail) {
    return {
      error: 'Email already in use',
    };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // TODO: Send verification email
  return {
    success: 'Account  created!',
  };
};
