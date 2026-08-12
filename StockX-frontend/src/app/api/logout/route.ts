import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('stockflow_refresh_token')?.value;
    const accessToken = req.cookies.get('stockflow_access_token')?.value;

    // Notify backend to revoke session if token is present
    if (refreshToken && accessToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Continue clearing client cookies even if backend network call fails
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear all auth cookies
    response.cookies.set('stockflow_access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockflow_refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockflow_user', '', { path: '/', maxAge: 0 });

    return response;
  } catch (error: any) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('stockflow_access_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockflow_refresh_token', '', { path: '/', maxAge: 0 });
    response.cookies.set('stockflow_user', '', { path: '/', maxAge: 0 });
    return response;
  }
}
