import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getCustomers } from '@/features/customers/services/customers.service';
import { CustomerListTable } from '@/features/customers/components/CustomerListTable';
import { CustomerStatus, CustomerType } from '@/features/customers/types/customers.types';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function CustomersRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  const { data: customers, total } = await getCustomers(
    {
      limit: 50,
      search: resolvedSearchParams.search,
      status: resolvedSearchParams.status as CustomerStatus,
      type: resolvedSearchParams.type as CustomerType,
    },
    accessToken,
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            <span>Customers CRM</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage customer accounts, follow-up timeline notes, and buyer profiles.
          </p>
        </div>

        <CustomerListTable initialCustomers={customers} total={total} />
      </div>
    </PortalLayout>
  );
}
