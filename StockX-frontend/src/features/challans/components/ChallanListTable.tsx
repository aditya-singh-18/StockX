'use client';

import React from 'react';
import { Challan } from '../types/challans.types';
import { ScrollText, Eye, ArrowUpRight, Calendar, User } from 'lucide-react';
import { ChallanSearchFilter } from './ChallanSearchFilter';
import { useRouter } from 'next/navigation';

interface ChallanListTableProps {
  initialChallans: Challan[];
  total: number;
}

export function ChallanListTable({ initialChallans, total }: ChallanListTableProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/challans/${id}`);
  };

  return (
    <div className="space-y-4">
      <ChallanSearchFilter />

      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-brand-400" />
              <span>Sales Delivery Challans</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing {initialChallans.length} of {total} delivery records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-brand-400/90 border-b border-brand-500/30 uppercase tracking-wider bg-brand-500/5">
                <th className="py-2.5 px-3 font-semibold rounded-l">Challan No</th>
                <th className="py-2.5 px-3 font-semibold">Customer</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Total Quantity</th>
                <th className="py-2.5 px-3 font-semibold">Total Amount</th>
                <th className="py-2.5 px-3 font-semibold">Created Date</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-r">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {initialChallans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No delivery challans found.
                  </td>
                </tr>
              ) : (
                initialChallans.map((challan) => (
                  <tr
                    key={challan.id}
                    onClick={() => handleRowClick(challan.id)}
                    className="hover:bg-[#1A1A1E] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-white group-hover:text-brand-300">
                      <div className="flex items-center gap-1.5">
                        <span>{challan.challanNo}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-200">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3 h-3 text-brand-400 shrink-0" />
                        <span>{challan.customer?.name || 'Customer Account'}</span>
                      </div>
                      {challan.customer?.businessName && (
                        <span className="text-[11px] text-gray-400 block font-normal">
                          {challan.customer.businessName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          challan.status === 'CONFIRMED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : challan.status === 'DRAFT'
                            ? 'bg-brand-500/15 text-brand-300 border-brand-500/40'
                            : 'bg-red-950/60 text-red-300 border-red-800/60'
                        }`}
                      >
                        {challan.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-gray-300">
                      {challan.totalQty} items
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span>
                          {new Date(challan.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(challan.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#27272A]/80 hover:bg-brand-500 hover:text-white text-gray-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
