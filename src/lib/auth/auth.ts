/**
 * Auth — Full Configuration (Node.js Runtime Only)
 *
 * Extends the Edge-safe base config with the CredentialsProvider,
 * which requires bcrypt and SQLite (Node.js APIs).
 *
 * Used by:
 *   - API route handler (src/app/api/auth/[...nextauth]/route.ts)
 *   - Server components needing session (via `auth()`)
 *
 * NOT used by middleware.ts — see authConfig.ts for the Edge-safe version.
 */
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { getUserByEmail, updateLastLogin } from '../database/database';
import { authConfig } from './authConfig';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').toLowerCase().trim();
        const password = String(credentials?.password ?? '');

        if (!email || !password) return null;

        const user = getUserByEmail(email);
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        updateLastLogin(user.id);

        return {
          id: String(user.id),
          email: user.email,
          name: user.display_name ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
});
