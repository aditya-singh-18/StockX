'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Plus, AlertTriangle, X, Filter, Layers } from 'lucide-react';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';

interface ProductSearchFilterProps {
  onAddClick: () => void;
}

export function ProductSearchFilter({ onAddClick }: ProductSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const isLowStockActive = searchParams.get('lowStock') === 'true';

  const [search, setSearch] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);

  // Sync internal state when URL searchParams change (e.g. browser back/forward or navigation)
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    setCategory(currentCategory);
  }, [currentCategory]);

  // Debounced search and category filter update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search === currentSearch && category === currentCategory) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) {
        params.set('search', search.trim());
      } else {
        params.delete('search');
      }

      if (category.trim()) {
        params.set('category', category.trim());
      } else {
        params.delete('category');
      }

      // Reset to page 1 whenever search or category changes
      params.delete('page');

      router.push(`${pathname}?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [search, category, currentSearch, currentCategory, router, pathname, searchParams]);

  const handleToggleLowStock = (enable: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (enable) {
      params.set('lowStock', 'true');
    } else {
      params.delete('lowStock');
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setCategory('');
    const params = new URLSearchParams();
    const currentLimit = searchParams.get('limit');
    if (currentLimit) {
      params.set('limit', currentLimit);
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const hasActiveFilters = Boolean(currentSearch || currentCategory || isLowStockActive);

  return (
    <div className="space-y-3">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Quick Filter Tabs */}
          <div className="inline-flex rounded-lg bg-[#141416] p-1 border border-[#27272A]">
            <button
              type="button"
              onClick={() => handleToggleLowStock(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !isLowStockActive
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Products</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLowStock(true)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isLowStockActive
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-gray-400 hover:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU or Product Name..."
              className="w-full pl-9 pr-8 py-2 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[160px] max-w-[200px]">
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Filter Category..."
              className="w-full pl-8 pr-7 py-2 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-all"
            />
            {category && (
              <button
                type="button"
                onClick={() => setCategory('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-0.5"
                title="Clear category"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-xs font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>Clear Filters</span>
            </button>
          )}
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
    </div>
  );
}
