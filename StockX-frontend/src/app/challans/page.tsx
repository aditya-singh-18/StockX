import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getChallans } from '@/features/challans/services/challans.service';
import { ChallanListTable } from '@/features/challans/components/ChallanListTable';
import { ChallanStatus } from '@/features/challans/types/challans.types';
import { ScrollText } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function ChallansRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  const { data: challans, total } = await getChallans(
    {
      limit: 50,
      search: resolvedSearchParams.search,
      status: resolvedSearchParams.status as ChallanStatus,
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

        <ChallanListTable initialChallans={challans} total={total} />
      </div>
    </PortalLayout>
  );
}
