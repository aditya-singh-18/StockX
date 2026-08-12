import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpointPath = path.join('/');
  const searchParams = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}/${endpointPath}${searchParams}`;

  let accessToken =
    req.cookies.get('stockflow_access_token')?.value ||
    req.cookies.get('stockflow_token_client')?.value;
  const refreshToken = req.cookies.get('stockflow_refresh_token')?.value;

  let refreshedData: { accessToken: string; refreshToken?: string; user?: any } | null = null;

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
          refreshedData = data;
        }
      }
    } catch {}
  }

  const headers = new Headers();
  headers.set('Content-Type', req.headers.get('content-type') || 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let body: any = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body || undefined,
      cache: 'no-store',
    });

    const responseText = await backendRes.text();
    const proxyResponse = new NextResponse(responseText, {
      status: backendRes.status,
      headers: {
        'content-type': backendRes.headers.get('content-type') || 'application/json',
      },
    });

    if (refreshedData) {
      const isProduction = process.env.NODE_ENV === 'production';
      proxyResponse.cookies.set('stockflow_access_token', refreshedData.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
      proxyResponse.cookies.set('stockflow_token_client', refreshedData.accessToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      });
      if (refreshedData.refreshToken) {
        proxyResponse.cookies.set('stockflow_refresh_token', refreshedData.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
      }
    }

    return proxyResponse;
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Error communicating with backend service' },
      { status: 500 },
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
