import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { getProducts } from '@/features/inventory/services/inventory.service';
import { ProductListTable } from '@/features/inventory/components/ProductListTable';
import { Package } from 'lucide-react';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    lowStock?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function InventoryRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { accessToken } = await getServerAuth();

  const page = resolvedSearchParams.page ? Math.max(1, parseInt(resolvedSearchParams.page, 10) || 1) : 1;
  const limit = resolvedSearchParams.limit ? Math.max(1, parseInt(resolvedSearchParams.limit, 10) || 10) : 10;
  const lowStock = resolvedSearchParams.lowStock === 'true' ? true : undefined;
  const search = resolvedSearchParams.search?.trim() || undefined;
  const category = resolvedSearchParams.category?.trim() || undefined;

  const { data: products, total, totalPages } = await getProducts(
    {
      page,
      limit,
      search,
      category,
      lowStock,
    },
    accessToken,
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-brand-400" />
            <span>Inventory & Products</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor real-time stock levels, SKU pricing, warehouse locations, and stock audit history.
          </p>
        </div>

        <ProductListTable
          initialProducts={products}
          total={total}
          currentPage={page}
          pageSize={limit}
          totalPages={totalPages}
        />
      </div>
    </PortalLayout>
  );
}
