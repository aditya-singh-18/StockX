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
): Promise<{ data: Customer[]; total: number; totalPages: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search.trim());
  if (query.status) params.set('status', query.status);
  if (query.type) params.set('type', query.type);

  const result = await apiFetch<any>(`/customers?${params.toString()}`, {}, token);

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
