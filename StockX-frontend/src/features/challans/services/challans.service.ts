import { API_BASE_URL, apiFetch } from '@/lib/api';
import { Challan, ChallanQueryDto, CreateChallanDto } from '../types/challans.types';

export async function getChallans(
  query: ChallanQueryDto = {},
  token?: string,
): Promise<{ data: Challan[]; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);

  const url = `${API_BASE_URL}/challans?${params.toString()}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    return { data: [], total: 0, totalPages: 1 };
  }
  return res.json();
}

export async function getChallanById(
  id: string,
  token?: string,
): Promise<{ data: Challan | null; error: string | null }> {
  const result = await apiFetch<Challan>(`/challans/${id}`, {}, token);
  return { data: result.data, error: result.error };
}

export async function createChallan(
  dto: CreateChallanDto,
  token?: string,
): Promise<{ data: Challan | null; error: string | null }> {
  const result = await apiFetch<Challan>(
    '/challans',
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function confirmChallan(
  challanId: string,
  token?: string,
): Promise<{ data: any; error: string | null }> {
  const result = await apiFetch(
    `/challans/${challanId}/confirm`,
    {
      method: 'POST',
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function cancelChallan(
  challanId: string,
  token?: string,
): Promise<{ data: any; error: string | null }> {
  const result = await apiFetch(
    `/challans/${challanId}/cancel`,
    {
      method: 'POST',
    },
    token,
  );

  return { data: result.data, error: result.error };
}
