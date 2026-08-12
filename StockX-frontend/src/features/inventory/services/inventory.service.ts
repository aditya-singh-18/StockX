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
  reason?: string;
  source?: string;
  note?: string | null;
  notes?: string | null;
  balanceAfter?: number;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export async function getProducts(
  query: ProductQueryDto = {},
  token?: string,
): Promise<{ data: Product[]; total: number; totalPages: number; page: number; limit: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search.trim());
  if (query.category) params.set('category', query.category.trim());
  if (query.lowStock === true) params.set('lowStock', 'true');

  const result = await apiFetch<any>(`/products?${params.toString()}`, {}, token);

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
    `/products/${productId}/stock-movements`,
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
  const result = await apiFetch<any>(`/products/${productId}/stock-movements`, {}, token);
  const items = Array.isArray(result.data?.data)
    ? result.data.data
    : Array.isArray(result.data)
    ? result.data
    : [];
  return { data: items, error: result.error };
}
