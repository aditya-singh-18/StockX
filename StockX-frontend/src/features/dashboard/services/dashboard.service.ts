import { API_BASE_URL, apiFetch } from '@/lib/api';
import { DashboardMetrics, DashboardRecentChallan } from '../types/dashboard.types';

export async function getDashboardData(token?: string): Promise<{
  metrics: DashboardMetrics;
  recentChallans: DashboardRecentChallan[];
  errors: string[];
}> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const errors: string[] = [];
  let totalCustomers = 0;
  let totalProducts = 0;
  let lowStockCount = 0;
  let totalChallans = 0;
  let recentChallans: DashboardRecentChallan[] = [];
  let backendOnline = false;

  try {
    const [custRes, prodRes, lowStockRes, chalRes] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/customers?limit=1`, { headers, cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${API_BASE_URL}/products?limit=1`, { headers, cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`${API_BASE_URL}/products?lowStock=true&limit=1`, { headers, cache: 'no-store' }).then(
        (r) => (r.ok ? r.json() : null),
      ),
      fetch(`${API_BASE_URL}/challans?limit=5`, { headers, cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]);

    if (custRes.status === 'fulfilled' && custRes.value) {
      totalCustomers = custRes.value.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('customers');
    }

    if (prodRes.status === 'fulfilled' && prodRes.value) {
      totalProducts = prodRes.value.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('products');
    }

    if (lowStockRes.status === 'fulfilled' && lowStockRes.value) {
      lowStockCount = lowStockRes.value.total ?? 0;
      backendOnline = true;
    } else {
      errors.push('lowStock');
    }

    if (chalRes.status === 'fulfilled' && chalRes.value) {
      totalChallans = chalRes.value.total ?? 0;
      recentChallans = chalRes.value.data ?? [];
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
