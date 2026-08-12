export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://stockx-7dz7.onrender.com';

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

/**
 * Universal API fetch client with automatic error formatting & token support
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
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
