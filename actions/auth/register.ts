'use server';
import * as z from 'zod';
import { RegisterSchema } from '@/app/auth/register/schema';
import { applyVerification, worldForEmail } from '@/lib/applyVerification';

export const register = async (
  values: z.infer<typeof RegisterSchema>,
): Promise<{ error: string; success?: undefined } | { success: string; error?: undefined }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedFields.data;
  const before = await worldForEmail(email);
  const decision = await applyVerification(
    before,
    { kind: 'register', email, name, password, send: 'accepted' },
    Date.now(),
  );

  if (decision.error) {
    return { error: decision.error };
  }
  if (decision.success) {
    return { success: decision.success };
  }
  return { error: 'Something went wrong' };
};
