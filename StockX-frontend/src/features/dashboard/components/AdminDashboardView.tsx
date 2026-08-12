import React from 'react';
import { UserPlus, PackagePlus, FilePlus } from 'lucide-react';
import { DashboardMetrics, DashboardRecentChallan } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { RecentChallansTable } from './RecentChallansTable';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';

interface AdminDashboardViewProps {
  metrics: DashboardMetrics;
  recentChallans: DashboardRecentChallan[];
  permissions: string[];
}

export function AdminDashboardView({
  metrics,
  recentChallans,
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards Grid */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* Quick Ops Action Bar */}
      <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 flex flex-wrap items-center gap-3 shadow-xs">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
          Quick Actions:
        </span>

        <RequirePermission permission={PERMISSIONS.CUSTOMER_CREATE}>
          <a
            href="/customers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-xs font-medium text-gray-200 hover:text-white transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-400" />
            <span>New Customer</span>
          </a>
        </RequirePermission>

        <RequirePermission permission={PERMISSIONS.PRODUCT_CREATE}>
          <a
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-xs font-medium text-gray-200 hover:text-white transition-colors"
          >
            <PackagePlus className="w-3.5 h-3.5 text-brand-400" />
            <span>Add Product</span>
          </a>
        </RequirePermission>

        <RequirePermission permission={PERMISSIONS.CHALLAN_CREATE}>
          <a
            href="/challans/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create Challan</span>
          </a>
        </RequirePermission>
      </div>

      {/* Recent Challans Activity Table */}
      <RecentChallansTable challans={recentChallans} />
    </div>
  );
}
