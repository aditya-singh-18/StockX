import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import {
  getProductById,
  getProductStockHistory,
} from '@/features/inventory/services/inventory.service';
import { ProductDetailCard } from '@/features/inventory/components/ProductDetailCard';
import { notFound } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const { accessToken } = await getServerAuth();

  const [{ data: product }, { data: history }] = await Promise.all([
    getProductById(resolvedParams.id, accessToken),
    getProductStockHistory(resolvedParams.id, accessToken),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <PortalLayout>
      <ProductDetailCard initialProduct={product} initialHistory={history || []} />
    </PortalLayout>
  );
}
