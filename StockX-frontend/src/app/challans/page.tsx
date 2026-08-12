import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { getChallans } from '@/features/challans/services/challans.service';
import { ChallanListTable } from '@/features/challans/components/ChallanListTable';
import { ChallanStatus } from '@/features/challans/types/challans.types';
import { ScrollText } from 'lucide-react';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function ChallansRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { accessToken } = await getServerAuth();

  const page = resolvedSearchParams.page ? Math.max(1, parseInt(resolvedSearchParams.page, 10) || 1) : 1;
  const limit = resolvedSearchParams.limit ? Math.max(1, parseInt(resolvedSearchParams.limit, 10) || 10) : 10;
  const search = resolvedSearchParams.search?.trim() || undefined;
  const status = resolvedSearchParams.status as ChallanStatus || undefined;

  const { data: challans, total, totalPages } = await getChallans(
    {
      page,
      limit,
      search,
      status,
    },
    accessToken,
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ScrollText className="w-6 h-6 text-brand-400" />
            <span>Sales Delivery Challans</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track multi-item delivery challans, stock dispatch statuses, and order totals.
          </p>
        </div>

        <ChallanListTable
          initialChallans={challans}
          total={total}
          currentPage={page}
          pageSize={limit}
          totalPages={totalPages}
        />
      </div>
    </PortalLayout>
  );
}
