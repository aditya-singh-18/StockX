import { API_BASE_URL, apiFetch } from '@/lib/api';
import {
  Customer,
  CustomerQueryDto,
  CreateCustomerDto,
  CustomerNote,
} from '../types/customers.types';

export async function getCustomers(
  query: CustomerQueryDto = {},
  token?: string,
): Promise<{ data: Customer[]; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  if (query.type) params.set('type', query.type);

  const url = `${API_BASE_URL}/customers?${params.toString()}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    return { data: [], total: 0, totalPages: 1 };
  }
  return res.json();
}

export async function getCustomerById(
  id: string,
  token?: string,
): Promise<{ data: Customer | null; error: string | null }> {
  const result = await apiFetch<Customer>(`/customers/${id}`, {}, token);
  return { data: result.data, error: result.error };
}

export async function createCustomer(
  dto: CreateCustomerDto,
  token?: string,
): Promise<{ data: Customer | null; error: string | null }> {
  const result = await apiFetch<Customer>(
    '/customers',
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function updateCustomer(
  id: string,
  dto: Partial<CreateCustomerDto>,
  token?: string,
): Promise<{ data: Customer | null; error: string | null }> {
  const result = await apiFetch<Customer>(
    `/customers/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function deleteCustomer(
  id: string,
  token?: string,
): Promise<{ data: any; error: string | null }> {
  const result = await apiFetch(
    `/customers/${id}`,
    {
      method: 'DELETE',
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function getCustomerNotes(
  customerId: string,
  token?: string,
): Promise<{ data: CustomerNote[]; error: string | null }> {
  const result = await apiFetch<CustomerNote[]>(`/customers/${customerId}/notes`, {}, token);
  return { data: result.data || [], error: result.error };
}

export async function addCustomerNote(
  customerId: string,
  note: string,
  token?: string,
): Promise<{ data: CustomerNote | null; error: string | null }> {
  const result = await apiFetch<CustomerNote>(
    `/customers/${customerId}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ note }),
    },
    token,
  );

  return { data: result.data, error: result.error };
}
