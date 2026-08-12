import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getDashboardData } from '@/features/dashboard/services/dashboard.service';
import { AdminDashboardView } from '@/features/dashboard/components/AdminDashboardView';
import { SalesDashboardView } from '@/features/dashboard/components/SalesDashboardView';
import { WarehouseDashboardView } from '@/features/dashboard/components/WarehouseDashboardView';
import { AccountsDashboardView } from '@/features/dashboard/components/AccountsDashboardView';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { API_BASE_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;
  const userCookie = cookieStore.get('stockflow_user')?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      try {
        user = JSON.parse(userCookie);
      } catch {
        user = null;
      }
    }
  }

  const permissions: string[] = user?.permissions || [];

  // Fetch real data from live backend
  const { metrics, recentChallans } = await getDashboardData(accessToken);

  // Render view based on permission capabilities (Zero hardcoded role strings!)
  const canManageUsers = hasPermission(permissions, PERMISSIONS.USER_MANAGE);
  const canCreateChallans = hasPermission(permissions, PERMISSIONS.CHALLAN_CREATE);
  const canAdjustStock = hasPermission(permissions, PERMISSIONS.PRODUCT_STOCK_ADJUST);
  const canReadChallans = hasPermission(permissions, PERMISSIONS.CHALLAN_READ);
  const canReadProducts = hasPermission(permissions, PERMISSIONS.PRODUCT_READ);

  let viewContent = (
    <AdminDashboardView
      metrics={metrics}
      recentChallans={recentChallans}
      permissions={permissions}
    />
  );

  if (!canManageUsers) {
    if (canCreateChallans && !canAdjustStock) {
      // Sales view
      viewContent = (
        <SalesDashboardView metrics={metrics} recentChallans={recentChallans} />
      );
    } else if (canAdjustStock && !canCreateChallans) {
      // Warehouse view
      viewContent = <WarehouseDashboardView metrics={metrics} />;
    } else if (canReadChallans && canReadProducts && !canCreateChallans) {
      // Accounts view
      viewContent = (
        <AccountsDashboardView metrics={metrics} recentChallans={recentChallans} />
      );
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome, {user?.name || 'Authorized User'}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md border bg-brand-500/20 text-brand-300 border-brand-500/40">
                {user?.role || 'Guest'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Logged in as <span className="font-mono text-brand-300">{user?.email}</span>
            </p>
          </div>

          {/* Live API Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141416] border border-brand-500/30 rounded-lg text-xs font-medium text-gray-300 shadow-xs w-fit">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.backendOnline ? 'bg-brand-500 animate-pulse' : 'bg-amber-500'
              }`}
            ></span>
            <span className="text-gray-400">API Host:</span>
            <span className="font-mono text-brand-400 font-medium">
              {(() => {
                try {
                  return new URL(API_BASE_URL).host;
                } catch {
                  return API_BASE_URL;
                }
              })()}
            </span>
          </div>
        </div>

        {/* Dynamic View Content */}
        {viewContent}
      </div>
    </PortalLayout>
  );
}
