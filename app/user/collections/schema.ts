import * as z from 'zod';
export const CollectionSchema = z.object({
  userId: z.string().email({
    message: 'User id is required',
  }),
  name: z.string(),
});
