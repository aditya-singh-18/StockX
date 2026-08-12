import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('stockflow_access_token')?.value;
  const refreshToken = request.cookies.get('stockflow_refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  const isAuthRoute = pathname === '/login';
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/challans') ||
    pathname.startsWith('/settings');

  // 1. If trying to access protected route without auth, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated user visits login or root, redirect to dashboard
  if (isAuthenticated && (isAuthRoute || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. If unauthenticated visits root, redirect to login
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/customers/:path*',
    '/inventory/:path*',
    '/challans/:path*',
    '/settings/:path*',
  ],
};
