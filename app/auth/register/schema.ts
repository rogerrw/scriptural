import * as z from 'zod';
export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Minimum length of 6 characters',
  }),
  name: z.string(),
});
