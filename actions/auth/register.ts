'use server';
import * as z from 'zod';
import { RegisterSchema } from '@/app/auth/register/schema';
import { decideEmailSignup } from '@/lib/emailSignup';

export const register = async (
  values: z.infer<typeof RegisterSchema>,
): Promise<
  { error: string; success?: undefined } | { success: string; error?: undefined }
> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedFields.data;

  const signup = decideEmailSignup({
    kind: 'register',
    email,
    name,
    password,
  });
  if ('error' in signup) {
    return signup;
  }

  return { error: 'Email signup is unavailable.' };
};
