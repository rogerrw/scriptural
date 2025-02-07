import * as z from 'zod';
export const UserVerseSchema = z.object({
  userId: z.string().min(1, {
    message: 'User Id is required',
  }),
  book: z.string().min(1, {
    message: 'Book name is required',
  }),
  chapter: z.number().min(1, {
    message: 'Chapter number is required',
  }),
  startingVerse: z.number().min(1, {
    message: 'Starting number for verse selection is required',
  }),
});
