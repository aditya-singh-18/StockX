'use client';

import React from 'react';
import { Users, Package, AlertTriangle, ScrollText } from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard.types';
import { usePermissions } from '@/lib/use-permissions';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

interface DashboardMetricsGridProps {
  metrics: DashboardMetrics;
}

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  const { permissions } = usePermissions();

  const canReadCustomers = hasPermission(permissions, PERMISSIONS.CUSTOMER_READ);
  const canReadProducts = hasPermission(permissions, PERMISSIONS.PRODUCT_READ);
  const canReadChallans = hasPermission(permissions, PERMISSIONS.CHALLAN_READ);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Customers */}
      {canReadCustomers ? (
        <div className="bg-[#141416] border border-[#27272A] hover:border-brand-500/50 hover:bg-[#17171A] rounded-xl p-4 transition-all duration-200 group shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-300">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {metrics.totalCustomers}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
              <span className="truncate">Active CRM records</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 opacity-40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold uppercase">
            <span>Customers CRM</span>
            <span className="text-[10px] font-mono">Restricted</span>
          </div>
          <div className="mt-3 text-xl font-bold text-gray-600">—</div>
          <p className="text-[11px] text-gray-600 mt-1">Permission required</p>
        </div>
      )}

      {/* 2. Catalog Products */}
      {canReadProducts ? (
        <div className="bg-[#141416] border border-[#27272A] hover:border-brand-500/50 hover:bg-[#17171A] rounded-xl p-4 transition-all duration-200 group shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-300">
              Catalog Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/25 transition-colors shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {metrics.totalProducts}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
              <span className="truncate">Managed SKUs & items</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 opacity-40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold uppercase">
            <span>Inventory Catalog</span>
            <span className="text-[10px] font-mono">Restricted</span>
          </div>
          <div className="mt-3 text-xl font-bold text-gray-600">—</div>
          <p className="text-[11px] text-gray-600 mt-1">Permission required</p>
        </div>
      )}

      {/* 3. Low-Stock Alerts */}
      {canReadProducts ? (
        <div className="bg-[#141416] border border-[#27272A] hover:border-brand-500/50 hover:bg-[#17171A] rounded-xl p-4 transition-all duration-200 group shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-300">
              Low-Stock Alerts
            </span>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
              metrics.lowStockCount > 0
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold tracking-tight ${
                metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {metrics.lowStockCount}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5 truncate">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  metrics.lowStockCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                }`}
              ></span>
              <span className="truncate">
                {metrics.lowStockCount > 0 ? 'Items below threshold' : 'All stock optimal'}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 opacity-40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold uppercase">
            <span>Low-Stock Alerts</span>
            <span className="text-[10px] font-mono">Restricted</span>
          </div>
          <div className="mt-3 text-xl font-bold text-gray-600">—</div>
          <p className="text-[11px] text-gray-600 mt-1">Permission required</p>
        </div>
      )}

      {/* 4. Sales Challans */}
      {canReadChallans ? (
        <div className="bg-[#141416] border border-[#27272A] hover:border-brand-500/50 hover:bg-[#17171A] rounded-xl p-4 transition-all duration-200 group shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-gray-300">
              Sales Challans
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
              <ScrollText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {metrics.totalChallans}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
              <span className="truncate">Fulfillment pipeline orders</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4 opacity-40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold uppercase">
            <span>Sales Challans</span>
            <span className="text-[10px] font-mono">Restricted</span>
          </div>
          <div className="mt-3 text-xl font-bold text-gray-600">—</div>
          <p className="text-[11px] text-gray-600 mt-1">Permission required</p>
        </div>
      )}
    </div>
  );
}
