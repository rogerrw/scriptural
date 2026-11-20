import { z } from 'zod';

export const VerseSetSchema = z.object({
  name: z.string().min(1),
});
