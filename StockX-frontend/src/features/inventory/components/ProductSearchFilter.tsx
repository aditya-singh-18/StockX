'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';

interface ProductSearchFilterProps {
  onAddClick: () => void;
}

export function ProductSearchFilter({ onAddClick }: ProductSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [lowStock, setLowStock] = useState(searchParams.get('lowStock') === 'true');

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set('search', search);
      else params.delete('search');

      if (category) params.set('category', category);
      else params.delete('category');

      if (lowStock) params.set('lowStock', 'true');
      else params.delete('lowStock');

      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, category, lowStock, router, pathname, searchParams]);

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
            placeholder="Search SKU or Product Name..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Filter Category..."
            className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Low Stock Toggle Button */}
        <button
          type="button"
          onClick={() => setLowStock(!lowStock)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
            lowStock
              ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-xs'
              : 'bg-[#141416] text-gray-400 border-[#27272A] hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Low Stock Only</span>
        </button>
      </div>

      {/* Permission-Gated Add Product Button */}
      <RequirePermission permission={PERMISSIONS.PRODUCT_CREATE}>
        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </RequirePermission>
    </div>
  );
}
