import { apiFetch } from '@/lib/api';
import { DashboardMetrics, DashboardRecentChallan } from '../types/dashboard.types';

export async function getDashboardData(token?: string): Promise<{
  metrics: DashboardMetrics;
  recentChallans: DashboardRecentChallan[];
  errors: string[];
}> {
  const errors: string[] = [];
  let totalCustomers = 0;
  let totalProducts = 0;
  let lowStockCount = 0;
  let totalChallans = 0;
  let recentChallans: DashboardRecentChallan[] = [];
  let backendOnline = false;

  try {
    const [custRes, prodRes, lowStockRes, chalRes] = await Promise.allSettled([
      apiFetch<any>('/customers?limit=1', { cache: 'no-store' }, token),
      apiFetch<any>('/products?limit=1', { cache: 'no-store' }, token),
      apiFetch<any>('/products?lowStock=true&limit=1', { cache: 'no-store' }, token),
      apiFetch<any>('/challans?limit=5', { cache: 'no-store' }, token),
    ]);

    if (custRes.status === 'fulfilled' && custRes.value.data) {
      totalCustomers = custRes.value.data.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('customers');
    }

    if (prodRes.status === 'fulfilled' && prodRes.value.data) {
      totalProducts = prodRes.value.data.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('products');
    }

    if (lowStockRes.status === 'fulfilled' && lowStockRes.value.data) {
      lowStockCount = lowStockRes.value.data.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('lowStock');
    }

    if (chalRes.status === 'fulfilled' && chalRes.value.data) {
      totalChallans = chalRes.value.data.total ?? 0;
      recentChallans = chalRes.value.data.data ?? [];
      backendOnline = true;
    } else {
      errors.push('challans');
    }
  } catch (err: any) {
    errors.push(err.message || 'network');
  }

  return {
    metrics: {
      totalCustomers,
      totalProducts,
      lowStockCount,
      totalChallans,
      backendOnline,
    },
    recentChallans,
    errors,
  };
}
