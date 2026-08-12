import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpointPath = path.join('/');
  const searchParams = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}/${endpointPath}${searchParams}`;

  const accessToken =
    req.cookies.get('stockflow_access_token')?.value ||
    req.cookies.get('stockflow_token_client')?.value;

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
    return new NextResponse(responseText, {
      status: backendRes.status,
      headers: {
        'content-type': backendRes.headers.get('content-type') || 'application/json',
      },
    });
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
