import { cookies } from 'next/headers';
import { API_BASE_URL, UserSession } from '@/lib/api';

export interface ServerAuthResult {
  accessToken?: string;
  user: UserSession | null;
  permissions: string[];
  isAuthenticated: boolean;
}

/**
 * Server-side authentication resolver for Next.js App Router Server Components.
 * Reads existing access token or automatically executes server-side token refresh
 * using the long-lived refresh token if the access token has expired.
 */
export async function getServerAuth(): Promise<ServerAuthResult> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('stockflow_access_token')?.value || undefined;
  const refreshToken = cookieStore.get('stockflow_refresh_token')?.value || undefined;
  const userCookie = cookieStore.get('stockflow_user')?.value || null;

  let user: UserSession | null = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      try {
        user = JSON.parse(userCookie);
      } catch {
        user = null;
      }
    }
  }

  // 1. If accessToken is missing or empty, but we have a valid refreshToken:
  if (!accessToken && refreshToken) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          accessToken = data.accessToken;
          if (data.user) {
            user = data.user;
          }
        }
      }
    } catch (err) {
      console.error('Server-side automatic token refresh error:', err);
    }
  }

  const permissions = user?.permissions || [];
  const isAuthenticated = Boolean(accessToken || refreshToken);

  return {
    accessToken,
    user,
    permissions,
    isAuthenticated,
  };
}
