import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let accessToken = request.cookies.get('stockx_access_token')?.value;
  const refreshToken = request.cookies.get('stockx_refresh_token')?.value;
  let isAuthenticated = Boolean(accessToken || refreshToken);

  const isAuthRoute = pathname === '/login';
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/challans') ||
    pathname.startsWith('/settings');

  let refreshedData: {
    accessToken: string;
    refreshToken?: string;
    user?: any;
  } | null = null;

  // If accessToken is expired/missing, but refreshToken exists, attempt silent refresh
  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken) {
          accessToken = data.accessToken;
          isAuthenticated = true;
          refreshedData = data;
        }
      } else {
        // Refresh token is invalid, expired, or revoked
        isAuthenticated = false;
      }
    } catch {
      // Backend unreachable or network issue
    }
  }

  // 1. If trying to access protected route without valid auth, redirect to login & clear cookies
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('stockx_access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockx_token_client', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockx_refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockx_user', '', { path: '/', maxAge: 0 });
    return response;
  }

  // 2. If authenticated user visits login or root, redirect to dashboard
  if (isAuthenticated && (isAuthRoute || pathname === '/')) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    if (refreshedData) {
      applyCookies(response, refreshedData);
    }
    return response;
  }

  // 3. If unauthenticated visits root, redirect to login
  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. If tokens were refreshed, pass updated cookies to downstream Server Components & client response
  if (refreshedData) {
    const requestHeaders = new Headers(request.headers);
    // Forward refreshed cookies in request headers so SSR Server Components can read them immediately
    request.cookies.set('stockx_access_token', refreshedData.accessToken);
    request.cookies.set('stockx_token_client', refreshedData.accessToken);
    if (refreshedData.refreshToken) {
      request.cookies.set('stockx_refresh_token', refreshedData.refreshToken);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    applyCookies(response, refreshedData);
    return response;
  }

  return NextResponse.next();
}

function applyCookies(
  response: NextResponse,
  data: { accessToken: string; refreshToken?: string; user?: any },
) {
  const isProduction = process.env.NODE_ENV === 'production';

  response.cookies.set('stockx_access_token', data.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  response.cookies.set('stockx_token_client', data.accessToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  });

  if (data.refreshToken) {
    response.cookies.set('stockx_refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  if (data.user) {
    response.cookies.set('stockx_user', JSON.stringify(data.user), {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }
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
