import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Call live NestJS backend /auth/login
    const backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      const errorMessage = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Invalid email or password';
      return NextResponse.json(
        { message: errorMessage },
        { status: backendRes.status },
      );
    }

    const { accessToken, refreshToken, user } = data;

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ success: true, user });

    // 1. Set Access Token Cookie (15 Minutes)
    response.cookies.set('stockflow_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    // 2. Set Refresh Token Cookie (7 Days)
    response.cookies.set('stockflow_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // 3. Set User Profile (Readable by client components for UI state)
    response.cookies.set('stockflow_user', JSON.stringify(user), {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error during login' },
      { status: 500 },
    );
  }
}
