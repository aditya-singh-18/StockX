import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getCustomers } from '@/features/customers/services/customers.service';
import { getProducts } from '@/features/inventory/services/inventory.service';
import { CreateChallanForm } from '@/features/challans/components/CreateChallanForm';

export const dynamic = 'force-dynamic';

export default async function CreateChallanRoute() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

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
