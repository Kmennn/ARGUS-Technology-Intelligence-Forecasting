import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  // Public routes
  const publicRoutes = ['/', '/login'];
  const isPublic = publicRoutes.includes(pathname);
  const isAuthApi = pathname.startsWith('/api/auth');
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

  if (isPublic || isAuthApi || isStatic) {
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
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
