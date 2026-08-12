'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../types/inventory.types';
import { getProducts } from '../services/inventory.service';
import {
  Package,
  AlertTriangle,
  Edit,
  Sliders,
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { ProductSearchFilter } from './ProductSearchFilter';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { AdjustStockModal } from './AdjustStockModal';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ProductListTableProps {
  initialProducts: Product[];
  total: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

export function ProductListTable({
  initialProducts,
  total,
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
}: ProductListTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalRecords, setTotalRecords] = useState<number>(total);
  const [page, setPage] = useState<number>(currentPage);
  const [limit, setLimit] = useState<number>(pageSize);
  const [pagesCount, setPagesCount] = useState<number>(totalPages);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEditProduct, setSelectedEditProduct] = useState<Product | null>(null);
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<Product | null>(null);

  // Sync state with incoming server props
  useEffect(() => {
    setProducts(initialProducts);
    setTotalRecords(total);
    setPage(currentPage);
    setLimit(pageSize);
    setPagesCount(totalPages);
  }, [initialProducts, total, currentPage, pageSize, totalPages]);

  const refreshData = async () => {
    setLoading(true);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const lowStock = searchParams.get('lowStock') === 'true' ? true : undefined;
    const activePage = Number(searchParams.get('page')) || 1;
    const activeLimit = Number(searchParams.get('limit')) || limit;

    const res = await getProducts({
      page: activePage,
      limit: activeLimit,
      search,
      category,
      lowStock,
    });

    if (res.data) {
      setProducts(res.data);
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
    params.set('page', '1'); // Reset to first page when limit changes
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRowClick = (id: string) => {
    router.push(`/inventory/${id}`);
  };

  const fromRecord = totalRecords === 0 ? 0 : (page - 1) * limit + 1;
  const toRecord = Math.min(page * limit, totalRecords);

  // Generate visible page numbers
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
      {/* Search & Filter Toolbar */}
      <ProductSearchFilter onAddClick={() => setIsAddOpen(true)} />

      {/* Main Table Card */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm space-y-4">
        {/* Table Header with Real-time Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-400" />
              <span>Inventory Products & Catalog</span>
              {loading && <Loader2 className="w-4 h-4 text-brand-400 animate-spin ml-2" />}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing <span className="text-gray-200 font-medium">{fromRecord}</span> to{' '}
              <span className="text-gray-200 font-medium">{toRecord}</span> of{' '}
              <span className="text-brand-400 font-semibold">{totalRecords}</span> SKU records.
            </p>
          </div>

          {/* Page Limit Selector (Top Right) */}
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-brand-400/90 border-b border-brand-500/30 uppercase tracking-wider bg-brand-500/5">
                <th className="py-2.5 px-3 font-semibold rounded-l">Product Details</th>
                <th className="py-2.5 px-3 font-semibold">SKU</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Unit Price</th>
                <th className="py-2.5 px-3 font-semibold">Stock Level</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-r">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 space-y-2">
                    <p className="text-sm font-medium">No product records matching current criteria.</p>
                    <p className="text-xs text-gray-500">
                      Try clearing filters or click &quot;Add Product&quot; to expand the inventory catalog.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLow = prod.currentStock <= prod.minStock;
                  return (
                    <tr
                      key={prod.id}
                      onClick={() => handleRowClick(prod.id)}
                      className="hover:bg-[#1A1A1E] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-3 font-semibold text-white group-hover:text-brand-300">
                        <div className="flex items-center gap-1.5">
                          <span>{prod.name}</span>
                          <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 transition-colors" />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-mono">{prod.sku}</td>
                      <td className="py-3 px-3 text-gray-400">{prod.category || '—'}</td>
                      <td className="py-3 px-3 text-gray-200 font-mono font-medium">
                        ₹{Number(prod.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isLow ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {prod.currentStock} units
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Low</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 font-mono">{prod.location || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RequirePermission permission={PERMISSIONS.PRODUCT_STOCK_ADJUST}>
                            <button
                              onClick={() => setSelectedAdjustProduct(prod)}
                              className="px-2 py-1 rounded bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1 border border-brand-500/40"
                              title="Adjust Stock"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Stock</span>
                            </button>
                          </RequirePermission>

                          <RequirePermission permission={PERMISSIONS.PRODUCT_UPDATE}>
                            <button
                              onClick={() => setSelectedEditProduct(prod)}
                              className="p-1 rounded bg-[#27272A] hover:bg-[#323238] text-gray-300 transition-colors"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </RequirePermission>

                          <button
                            onClick={() => handleRowClick(prod.id)}
                            className="p-1 rounded bg-[#27272A] hover:bg-[#323238] text-gray-300 transition-colors"
                            title="View Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        {totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#27272A] text-xs">
            <div className="text-gray-400">
              Page <span className="text-white font-medium">{page}</span> of{' '}
              <span className="text-white font-medium">{pagesCount}</span> ({totalRecords} total items)
            </div>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Page Number Buttons */}
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

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagesCount}
                className="px-2.5 py-1 rounded-lg bg-[#1C1C20] border border-[#27272A] text-gray-300 hover:text-white hover:border-brand-500 disabled:opacity-40 disabled:hover:border-[#27272A] disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
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

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={refreshData}
      />

      <EditProductModal
        isOpen={!!selectedEditProduct}
        product={selectedEditProduct}
        onClose={() => setSelectedEditProduct(null)}
        onSuccess={refreshData}
      />

      <AdjustStockModal
        isOpen={!!selectedAdjustProduct}
        product={selectedAdjustProduct}
        onClose={() => setSelectedAdjustProduct(null)}
        onSuccess={refreshData}
      />
    </div>
  );
}
