/**
 * Auth Config — Edge-Safe Base
 *
 * This file contains ONLY the session/callback/pages config.
 * NO database imports, NO bcrypt, NO Node.js APIs.
 * Safe for import by middleware.ts (Edge Runtime).
 *
 * The CredentialsProvider with DB lookups lives in auth.ts,
 * which is only used by the Node.js API route handler.
 */
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [], // Populated in auth.ts — kept empty here for Edge safety
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
    authorized({ auth, request }) {
      // This callback is used by middleware (Edge Runtime).
      // Return true/false to allow/deny. Returning false redirects to signIn page.
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth;

      const publicRoutes = ['/', '/login'];
      const isPublic = publicRoutes.includes(pathname);

      if (isPublic) return true;
      return isLoggedIn;
    },
  },
};
