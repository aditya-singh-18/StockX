import { API_BASE_URL, apiFetch } from '@/lib/api';
import { Challan, ChallanQueryDto, CreateChallanDto } from '../types/challans.types';

export async function getChallans(
  query: ChallanQueryDto = {},
  token?: string,
): Promise<{ data: Challan[]; total: number; totalPages: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search.trim());
  if (query.status) params.set('status', query.status);

  const result = await apiFetch<any>(`/challans?${params.toString()}`, {}, token);

  if (result.data) {
    return {
      data: Array.isArray(result.data.data)
        ? result.data.data
        : Array.isArray(result.data)
        ? result.data
        : [],
      total: result.data.total ?? 0,
      totalPages: result.data.totalPages ?? 1,
      page: result.data.page ?? (query.page || 1),
      limit: result.data.limit ?? (query.limit || 10),
    };
  }
  return { data: [], total: 0, totalPages: 1, page: query.page || 1, limit: query.limit || 10 };
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
