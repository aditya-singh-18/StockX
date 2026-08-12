import { API_BASE_URL, apiFetch } from '@/lib/api';
import {
  Product,
  ProductQueryDto,
  CreateProductDto,
  AdjustStockDto,
} from '../types/inventory.types';

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason: string;
  notes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export async function getProducts(
  query: ProductQueryDto = {},
  token?: string,
): Promise<{ data: Product[]; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.lowStock !== undefined) params.set('lowStock', String(query.lowStock));

  const url = `${API_BASE_URL}/products?${params.toString()}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) {
    return { data: [], total: 0, totalPages: 1 };
  }
  return res.json();
}

export async function getProductById(
  id: string,
  token?: string,
): Promise<{ data: Product | null; error: string | null }> {
  const result = await apiFetch<Product>(`/products/${id}`, {}, token);
  return { data: result.data, error: result.error };
}

export async function createProduct(
  dto: CreateProductDto,
  token?: string,
): Promise<{ data: Product | null; error: string | null }> {
  const result = await apiFetch<Product>(
    '/products',
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function updateProduct(
  id: string,
  dto: Partial<CreateProductDto>,
  token?: string,
): Promise<{ data: Product | null; error: string | null }> {
  const result = await apiFetch<Product>(
    `/products/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function adjustStock(
  productId: string,
  dto: AdjustStockDto,
  token?: string,
): Promise<{ data: any; error: string | null }> {
  const result = await apiFetch(
    `/products/${productId}/stock-adjust`,
    {
      method: 'POST',
      body: JSON.stringify(dto),
    },
    token,
  );

  return { data: result.data, error: result.error };
}

export async function getProductStockHistory(
  productId: string,
  token?: string,
): Promise<{ data: StockMovement[]; error: string | null }> {
  const result = await apiFetch<StockMovement[]>(`/products/${productId}/history`, {}, token);
  return { data: result.data || [], error: result.error };
}
