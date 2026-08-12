'use client';

import React from 'react';
import { ScrollText, ArrowRight, ArrowUpRight } from 'lucide-react';
import { DashboardRecentChallan } from '../types/dashboard.types';
import { usePermissions } from '@/lib/use-permissions';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

interface RecentChallansTableProps {
  challans: DashboardRecentChallan[];
}

export function RecentChallansTable({ challans }: RecentChallansTableProps) {
  const router = useRouter();
  const { permissions } = usePermissions();
  const canReadChallans = hasPermission(permissions, PERMISSIONS.CHALLAN_READ);

  if (!canReadChallans) {
    return (
      <div className="bg-[#141416] border border-[#27272A] rounded-xl p-6 text-center text-xs text-gray-500 shadow-xs">
        Challans feed is restricted for your role. Contact an administrator to request access.
      </div>
    );
  }

  return (
    <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-brand-400" />
            <span>Recent Sales Delivery Challans</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Live fulfillment orders directly from database records.
          </p>
        </div>
        <a
          href="/challans"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors px-2.5 py-1 rounded bg-brand-500/10 border border-brand-500/20"
        >
          <span>View All Challans</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {challans.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400 italic">
          No delivery challans recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-brand-400/90 border-b border-brand-500/30 uppercase tracking-wider bg-brand-500/5">
                <th className="py-2.5 px-3 font-semibold rounded-l">Challan No</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Line Items</th>
                <th className="py-2.5 px-3 font-semibold">Total Amount</th>
                <th className="py-2.5 px-3 font-semibold rounded-r">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {challans.map((challan) => {
                const statusStyle =
                  challan.status === 'CONFIRMED'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : challan.status === 'CANCELLED'
                    ? 'bg-red-950/60 text-red-300 border-red-800/60'
                    : 'bg-brand-500/15 text-brand-300 border-brand-500/40';

                return (
                  <tr
                    key={challan.id}
                    onClick={() => router.push(`/challans/${challan.id}`)}
                    className="hover:bg-[#1A1A1E] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-white group-hover:text-brand-300">
                      <div className="flex items-center gap-1.5">
                        <span>{challan.challanNo}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-200 font-medium">
                      {challan.customer?.name || challan.customer?.businessName || 'Customer'}
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      {new Date(challan.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-mono">
                      {challan.items?.length || challan._count?.items || 0} items ({challan.totalQty || 0} units)
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ₹{Number(challan.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusStyle}`}
                      >
                        {challan.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
