export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales' | 'Warehouse' | 'Accounts' | string;
  roleId: string;
  permissions: string[];
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

function getClientToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )stockflow_token_client=([^;]*)'));
  if (match && match[1]) return decodeURIComponent(match[1]);
  const fallback = document.cookie.match(new RegExp('(?:^|; )stockflow_access_token=([^;]*)'));
  return fallback && fallback[1] ? decodeURIComponent(fallback[1]) : null;
}

/**
 * Universal API fetch client with automatic error formatting & token support
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<{ data: T | null; error: string | null; status: number }> {
  const activeToken = token || getClientToken();

  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (typeof window !== 'undefined' && !activeToken) {
    url = `/api/proxy${endpoint}`;
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (activeToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${activeToken}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const status = response.status;

    if (status === 204) {
      return { data: null, error: null, status };
    }

    let responseData: any = null;
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred';
      if (responseData?.message) {
        errorMessage = Array.isArray(responseData.message)
          ? responseData.message.join(', ')
          : responseData.message;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      }
      return { data: null, error: errorMessage, status };
    }

    return { data: responseData as T, error: null, status };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'Unable to connect to backend server',
      status: 500,
    };
  }
}
