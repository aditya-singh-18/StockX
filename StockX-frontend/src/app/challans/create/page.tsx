import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { getCustomers } from '@/features/customers/services/customers.service';
import { getProducts } from '@/features/inventory/services/inventory.service';
import { CreateChallanForm } from '@/features/challans/components/CreateChallanForm';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export default async function CreateChallanRoute() {
  const { accessToken } = await getServerAuth();

  const [{ data: customers }, { data: products }] = await Promise.all([
    getCustomers({ limit: 100 }, accessToken),
    getProducts({ limit: 100 }, accessToken),
  ]);

  return (
    <PortalLayout>
      <CreateChallanForm customers={customers} products={products} />
    </PortalLayout>
  );
}
