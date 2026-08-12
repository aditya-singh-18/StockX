'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Plus, Filter } from 'lucide-react';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import Link from 'next/link';

export function ChallanSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set('search', search);
      else params.delete('search');

      if (status) params.set('status', status);
      else params.delete('status');

      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, status, router, pathname, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1">
        {/* Search Bar */}
        <div className="relative min-w-[240px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Challan No or Customer..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none bg-[#141416] border border-[#27272A] rounded-lg text-xs text-gray-300 px-3.5 py-2 pr-8 focus:outline-none focus:border-brand-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <Filter className="w-3 h-3 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Permission-Gated Create Button */}
      <RequirePermission permission={PERMISSIONS.CHALLAN_CREATE}>
        <Link
          href="/challans/create"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Challan</span>
        </Link>
      </RequirePermission>
    </div>
  );
}
