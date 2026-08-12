import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('stockflow_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token available' },
        { status: 401 },
      );
    }

    // Call live NestJS backend /auth/refresh
    const backendRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const response = NextResponse.json(
        { success: false, message: data.message || 'Refresh failed' },
        { status: 401 },
      );
      // Clear cookies on refresh failure
      response.cookies.set('stockflow_access_token', '', { path: '/', maxAge: 0 });
      response.cookies.set('stockflow_token_client', '', { path: '/', maxAge: 0 });
      response.cookies.set('stockflow_refresh_token', '', { path: '/', maxAge: 0 });
      return response;
    }

    const { accessToken, refreshToken: newRefreshToken } = data;
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ success: true, accessToken });

    // 1. Update Access Token Cookie (15 Minutes) - HttpOnly
    response.cookies.set('stockflow_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    // 2. Update Client Token Cookie
    response.cookies.set('stockflow_token_client', accessToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    // 3. Update Refresh Token Cookie (7 Days)
    if (newRefreshToken) {
      response.cookies.set('stockflow_refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal refresh error' },
      { status: 500 },
    );
  }
}
