import React from 'react';
import { Package, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { DashboardMetrics } from '../types/dashboard.types';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';

interface WarehouseDashboardViewProps {
  metrics: DashboardMetrics;
}

export function WarehouseDashboardView({ metrics }: WarehouseDashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Real Data Stat Cards */}
      <DashboardMetricsGrid metrics={metrics} />

      {/* Warehouse Stock Operations Card */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Warehouse Stock Management</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Record inward shipments, perform audit adjustments, and track low-stock thresholds.
          </p>
        </div>
        <a
          href="/inventory"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Adjust Stock / View Catalog</span>
        </a>
      </div>

      {metrics.lowStockCount > 0 && (
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-amber-300">
              Low Stock Priority Notice ({metrics.lowStockCount} Item(s) Need Reorder)
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Some items have fallen below their minimum safety stock threshold. Inward stock adjustments should be performed promptly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
