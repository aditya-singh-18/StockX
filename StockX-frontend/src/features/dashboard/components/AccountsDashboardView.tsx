import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { DashboardMetrics, DashboardRecentChallan } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { RecentChallansTable } from './RecentChallansTable';

interface AccountsDashboardViewProps {
  metrics: DashboardMetrics;
  recentChallans: DashboardRecentChallan[];
}

export function AccountsDashboardView({
  metrics,
  recentChallans,
}: AccountsDashboardViewProps) {
  const confirmedChallans = recentChallans.filter((c) => c.status === 'CONFIRMED');
  const draftChallans = recentChallans.filter((c) => c.status === 'DRAFT');

  const confirmedValue = confirmedChallans.reduce(
    (acc, curr) => acc + Number(curr.totalAmount || 0),
    0,
  );
  const draftValue = draftChallans.reduce(
    (acc, curr) => acc + Number(curr.totalAmount || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* 4 Real Data Stat Cards */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* Financial Valuation Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-emerald-500 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Confirmed Dispatches Value</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400">
            ₹{confirmedValue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            From {confirmedChallans.length} confirmed challan(s) in active page
          </p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase">
            <span>Pending Draft Value</span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-brand-400">
            ₹{draftValue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            From {draftChallans.length} draft challan(s) awaiting confirmation
          </p>
        </div>
      </div>

      {/* Recent Challans Activity Table */}
      <RecentChallansTable challans={recentChallans} />
    </div>
  );
}
