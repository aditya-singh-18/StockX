'use client';

import React, { useState } from 'react';
import { Product } from '../types/inventory.types';
import { Package, AlertTriangle, Edit, Sliders, Eye, ArrowUpRight } from 'lucide-react';
import { ProductSearchFilter } from './ProductSearchFilter';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { AdjustStockModal } from './AdjustStockModal';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

interface ProductListTableProps {
  initialProducts: Product[];
  total: number;
}

export function ProductListTable({ initialProducts, total }: ProductListTableProps) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEditProduct, setSelectedEditProduct] = useState<Product | null>(null);
  const [selectedAdjustProduct, setSelectedAdjustProduct] = useState<Product | null>(null);

  const handleRowClick = (id: string) => {
    router.push(`/inventory/${id}`);
  };

  return (
    <div className="space-y-4">
      <ProductSearchFilter onAddClick={() => setIsAddOpen(true)} />

      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-400" />
              <span>Inventory Products & Catalog</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing {initialProducts.length} of {total} SKU records.
            </p>
          </div>
        </div>

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
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No product records matching current criteria.
                  </td>
                </tr>
              ) : (
                initialProducts.map((prod) => {
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
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
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
      </div>

      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <EditProductModal
        isOpen={!!selectedEditProduct}
        product={selectedEditProduct}
        onClose={() => setSelectedEditProduct(null)}
        onSuccess={() => router.refresh()}
      />

      <AdjustStockModal
        isOpen={!!selectedAdjustProduct}
        product={selectedAdjustProduct}
        onClose={() => setSelectedAdjustProduct(null)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
