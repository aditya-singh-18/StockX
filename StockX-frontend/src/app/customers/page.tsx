import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { getCustomers } from '@/features/customers/services/customers.service';
import { CustomerListTable } from '@/features/customers/components/CustomerListTable';
import { CustomerStatus, CustomerType } from '@/features/customers/types/customers.types';
import { Users } from 'lucide-react';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    type?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function CustomersRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { accessToken } = await getServerAuth();

  const page = resolvedSearchParams.page ? Math.max(1, parseInt(resolvedSearchParams.page, 10) || 1) : 1;
  const limit = resolvedSearchParams.limit ? Math.max(1, parseInt(resolvedSearchParams.limit, 10) || 10) : 10;
  const search = resolvedSearchParams.search?.trim() || undefined;
  const status = (resolvedSearchParams.status as CustomerStatus) || undefined;
  const type = (resolvedSearchParams.type as CustomerType) || undefined;

  const { data: customers, total, totalPages } = await getCustomers(
    {
      page,
      limit,
      search,
      status,
      type,
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

        <CustomerListTable
          initialCustomers={customers}
          total={total}
          currentPage={page}
          pageSize={limit}
          totalPages={totalPages}
        />
      </div>
    </PortalLayout>
  );
}
