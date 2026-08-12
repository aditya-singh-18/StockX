'use client';

import React, { useState, useEffect } from 'react';
import { Challan } from '../types/challans.types';
import {
  ScrollText,
  Eye,
  ArrowUpRight,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { ChallanSearchFilter } from './ChallanSearchFilter';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ChallanListTableProps {
  initialChallans: Challan[];
  total: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

export function ChallanListTable({
  initialChallans,
  total,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
}: ChallanListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [challans, setChallans] = useState<Challan[]>(initialChallans);
  const [totalRecords, setTotalRecords] = useState<number>(total);
  const [page, setPage] = useState<number>(currentPage);
  const [limit, setLimit] = useState<number>(pageSize);
  const [pagesCount, setPagesCount] = useState<number>(totalPages);

  useEffect(() => {
    setChallans(initialChallans);
    setTotalRecords(total);
    setPage(currentPage);
    setLimit(pageSize);
    setPagesCount(totalPages);
  }, [initialChallans, total, currentPage, pageSize, totalPages]);

  const handleRowClick = (id: string) => {
    router.push(`/challans/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagesCount || newPage === page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(newLimit));
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const fromRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const toRecord = Math.min(page * limit, totalRecords);

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisible = 5;

    if (pagesCount <= maxVisible) {
      for (let i = 1; i <= pagesCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (page > 3) {
        pageNumbers.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(pagesCount - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (page < pagesCount - 2) {
        pageNumbers.push('...');
      }
      pageNumbers.push(pagesCount);
    }

    return pageNumbers;
  };

  return (
    <div className="space-y-4">
      <ChallanSearchFilter />

      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-brand-400" />
              <span>Sales Delivery Challans</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing <span className="text-gray-200 font-medium">{fromRecord}</span> to{' '}
              <span className="text-gray-200 font-medium">{toRecord}</span> of{' '}
              <span className="text-brand-400 font-semibold">{totalRecords}</span> delivery records.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Per Page:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="bg-[#1C1C20] border border-[#27272A] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
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
              {challans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No delivery challans found.
                  </td>
                </tr>
              ) : (
                challans.map((challan) => (
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

        {/* Pagination Footer */}
        {totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#27272A] text-xs">
            <div className="text-gray-400">
              Page <span className="text-white font-medium">{page}</span> of{' '}
              <span className="text-white font-medium">{pagesCount}</span> ({totalRecords} total items)
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((num, idx) =>
                  typeof num === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(num)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-all ${
                        num === page
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500'
                      }`}
                    >
                      {num}
                    </button>
                  ) : (
                    <span key={idx} className="px-1 text-gray-500 select-none">
                      ...
                    </span>
                  ),
                )}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagesCount}
                className="px-2.5 py-1 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handlePageChange(pagesCount)}
                disabled={page >= pagesCount}
                className="p-1.5 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
