import { type UserRole } from '@prisma/client';
import NextAuth, { type DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole;
};

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser;
  }
}
