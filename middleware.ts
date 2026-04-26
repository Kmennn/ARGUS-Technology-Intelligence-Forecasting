/**
 * Edge Middleware — Route Protection
 *
 * Uses the Edge-safe authConfig (no DB, no bcrypt, no Node.js APIs).
 * Session validation is JWT-only — the token is decoded from the cookie,
 * no database round-trip needed.
 */
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/authConfig';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  // Public routes — no auth required
  const publicRoutes = ['/', '/login'];
  const isPublic = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith('/api/auth');
  const isApiRoute = pathname.startsWith('/api/');
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isPublic || isAuthApi || isStatic || isApiRoute) {
    // Logged-in user visiting /login — send them to dashboard
    if (pathname === '/login' && isLoggedIn) {
      return NextResponse.redirect(new URL('/overview', req.nextUrl));
    }
    return NextResponse.next();
  }

  // All other routes require login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only gate for /calibration
  if (pathname.startsWith('/calibration') && role !== 'admin') {
    return NextResponse.redirect(new URL('/overview?notice=admin-only', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
