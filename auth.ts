import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { type UserRole } from '@prisma/client';
import authConfig from '@/auth.config';
import { getUserById } from '@/data/user';
import prisma from '@/prisma';

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  callbacks: {
    // async signIn({ user }) {
    //   if (!user.id) {
    //     return false;
    //   }

    //   const existingUser = await getUserById(user.id);

    //   if (!existingUser || !existingUser.emailVerified) {
    //     return false;
    //   }

    //   return true;
    // },
    async session({ token, session }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      if (session.user && token.role) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) {
        // user is logged out
        return token;
      }
      const user = await getUserById(token.sub);

      if (!user) {
        return token;
      }

      token.role = user.role;
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
});
