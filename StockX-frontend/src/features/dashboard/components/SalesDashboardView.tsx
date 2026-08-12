import React from 'react';
import { UserPlus, FilePlus, Users, ScrollText } from 'lucide-react';
import { DashboardMetrics, DashboardRecentChallan } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { RecentChallansTable } from './RecentChallansTable';

interface SalesDashboardViewProps {
  metrics: DashboardMetrics;
  recentChallans: DashboardRecentChallan[];
}

export function SalesDashboardView({ metrics, recentChallans }: SalesDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Real Data Stat Cards */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* Sales Fast-Track Action Bar */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Sales & Dispatch Fast-Track</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Create new customer profiles and dispatch challans with automatic stock checks.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/customers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-xs font-medium text-gray-200 hover:text-white transition-colors"
          >
            <UserPlus className="w-4 h-4 text-brand-400" />
            <span>Manage Customers</span>
          </a>
          <a
            href="/challans"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <FilePlus className="w-4 h-4" />
            <span>New Challan</span>
          </a>
        </div>
      </div>

      {/* Recent Challans Activity Table */}
      <RecentChallansTable challans={recentChallans} />
    </div>
  );
}
