import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getProducts } from '@/features/inventory/services/inventory.service';
import { ProductListTable } from '@/features/inventory/components/ProductListTable';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    lowStock?: string;
  }>;
}

export default async function InventoryRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  const { data: products, total } = await getProducts(
    {
      limit: 50,
      search: resolvedSearchParams.search,
      category: resolvedSearchParams.category,
      lowStock: resolvedSearchParams.lowStock === 'true',
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

        <ProductListTable initialProducts={products} total={total} />
      </div>
    </PortalLayout>
  );
}
