import * as z from 'zod';
export const VerseSetSchema = z.object({
  userId: z.string({
    message: 'User id is required',
  }),
  name: z.string(),
});
