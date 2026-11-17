'use server';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@/app/auth/signin/schema';
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { applyVerification, worldForEmail } from '@/lib/applyVerification';

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password } = validatedFields.data;
  const before = await worldForEmail(email);
  const account = before.users[0];
  const passwordMatches = account?.password
    ? await bcrypt.compare(password, account.password)
    : false;
  const decision = await applyVerification(
    before,
    { kind: 'sign-in', email, passwordMatches, send: 'accepted' },
    Date.now(),
  );

  if (!decision.signedIn) {
    if (decision.error) {
      return { error: decision.error };
    }
    if (decision.success) {
      return { success: decision.success };
    }
    return { error: 'Something went wrong' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errorCause: NodeJS.ErrnoException | undefined = error.cause?.err;

      switch (errorCause?.code) {
        case 'credentials':
          return { error: 'Invalid credentials' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }

  return {
    success: 'Sent',
  };
};
