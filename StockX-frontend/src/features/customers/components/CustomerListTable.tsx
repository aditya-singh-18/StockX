'use client';

import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus, CustomerType } from '../types/customers.types';
import { getCustomers } from '../services/customers.service';
import {
  Users,
  Phone,
  Mail,
  Clock,
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { CustomerSearchFilter } from './CustomerSearchFilter';
import { AddCustomerModal } from './AddCustomerModal';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface CustomerListTableProps {
  initialCustomers: Customer[];
  total: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

export function CustomerListTable({
  initialCustomers,
  total,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
}: CustomerListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [totalRecords, setTotalRecords] = useState<number>(total);
  const [page, setPage] = useState<number>(currentPage);
  const [limit, setLimit] = useState<number>(pageSize);
  const [pagesCount, setPagesCount] = useState<number>(totalPages);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    setCustomers(initialCustomers);
    setTotalRecords(total);
    setPage(currentPage);
    setLimit(pageSize);
    setPagesCount(totalPages);
  }, [initialCustomers, total, currentPage, pageSize, totalPages]);

  const refreshData = async () => {
    setLoading(true);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as CustomerStatus) || undefined;
    const type = (searchParams.get('type') as CustomerType) || undefined;
    const activePage = Number(searchParams.get('page')) || 1;
    const activeLimit = Number(searchParams.get('limit')) || limit;

    const res = await getCustomers({
      page: activePage,
      limit: activeLimit,
      search,
      status,
      type,
    });

    if (res.data) {
      setCustomers(res.data);
      setTotalRecords(res.total);
      setPage(res.page);
      setLimit(res.limit);
      setPagesCount(res.totalPages);
    }
    setLoading(false);
    router.refresh();
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

  const handleRowClick = (id: string) => {
    router.push(`/customers/${id}`);
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
      {/* Search & Action Toolbar */}
      <CustomerSearchFilter onAddClick={() => setIsAddOpen(true)} />

      {/* Customer List Card */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              <span>Customer Directory</span>
              {loading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin ml-2" />}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing <span className="text-gray-200 font-medium">{fromRecord}</span> to{' '}
              <span className="text-gray-200 font-medium">{toRecord}</span> of{' '}
              <span className="text-brand-400 font-semibold">{totalRecords}</span> registered customer records.
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
                <th className="py-2.5 px-3 font-semibold rounded-l">Customer Name</th>
                <th className="py-2.5 px-3 font-semibold">Business</th>
                <th className="py-2.5 px-3 font-semibold">Contact Details</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Follow-Up</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-r">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleRowClick(customer.id)}
                    className="hover:bg-[#1A1A1E] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-semibold text-white group-hover:text-brand-300">
                      <div className="flex items-center gap-1.5">
                        <span>{customer.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-medium">
                      {customer.businessName || '—'}
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Phone className="w-3 h-3 text-brand-400" />
                        <span>{customer.mobile}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1C1C20] text-gray-300 border border-[#27272A]">
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          customer.status === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : customer.status === 'LEAD'
                            ? 'bg-brand-500/15 text-brand-300 border-brand-500/40'
                            : 'bg-zinc-800 text-gray-400 border-zinc-700'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      {customer.followUpDate ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(customer.id);
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

        {/* Pagination Controls */}
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

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
