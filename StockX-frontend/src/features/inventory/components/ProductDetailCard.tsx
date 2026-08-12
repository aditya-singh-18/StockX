'use client';

import React, { useState } from 'react';
import { Product } from '../types/inventory.types';
import { StockMovement } from '../services/inventory.service';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { EditProductModal } from './EditProductModal';
import { AdjustStockModal } from './AdjustStockModal';
import {
  Package,
  Sliders,
  Edit,
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  History,
  Tag,
  MapPin,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface ProductDetailCardProps {
  initialProduct: Product;
  initialHistory: StockMovement[];
}

export function ProductDetailCard({ initialProduct, initialHistory }: ProductDetailCardProps) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [history] = useState<StockMovement[]>(initialHistory);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const isLow = product.currentStock <= product.minStock;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="p-2 rounded-lg bg-[#141416] border border-[#27272A] text-gray-400 hover:text-white hover:border-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{product.name}</h1>
              {isLow && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Low Stock Warning</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              SKU: {product.sku} • Category: {product.category || 'General'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <RequirePermission permission={PERMISSIONS.PRODUCT_STOCK_ADJUST}>
            <button
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition-colors shadow-xs"
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust Stock</span>
            </button>
          </RequirePermission>

          <RequirePermission permission={PERMISSIONS.PRODUCT_UPDATE}>
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#27272A] hover:bg-[#323238] text-xs font-semibold text-gray-200 transition-colors border border-[#3F3F46]"
            >
              <Edit className="w-3.5 h-3.5 text-brand-400" />
              <span>Edit Details</span>
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 space-y-4 lg:col-span-1 shadow-sm">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272A] flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            <span>Inventory Metrics</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Current Physical Stock</span>
              <span
                className={`text-xl font-bold font-mono ${
                  isLow ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {product.currentStock} units
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#27272A]">
              <div>
                <span className="text-gray-400 block mb-0.5">Min Alert Level</span>
                <span className="text-gray-200 font-mono font-medium">{product.minStock} units</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">Unit Price</span>
                <span className="text-white font-mono font-bold">
                  ₹{Number(product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#27272A]">
              <span className="text-gray-400 block mb-0.5">Warehouse Location</span>
              <div className="flex items-center gap-2 text-gray-200 font-mono font-medium">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                <span>{product.location || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">Created Date</span>
              <div className="flex items-center gap-2 text-gray-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Movement History */}
        <div className="lg:col-span-2 bg-[#141416] border border-[#27272A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <span>Stock Movement Audit Log</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">{history.length} Movements</span>
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4">No stock movement entries found for this product.</p>
            ) : (
              history.map((mov) => (
                <div
                  key={mov.id}
                  className="p-3 bg-[#1C1C20]/70 border border-[#27272A] rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          mov.type === 'IN'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-red-950/80 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {mov.type === 'IN' ? `+${mov.quantity} IN` : `-${mov.quantity} OUT`}
                      </span>
                      <span className="text-gray-300 font-medium">{mov.reason}</span>
                    </div>
                    {mov.notes && <p className="text-gray-400 text-[11px]">{mov.notes}</p>}
                  </div>

                  <div className="text-right text-[11px] text-gray-400 space-y-0.5">
                    <div className="flex items-center justify-end gap-1 text-gray-300 font-medium">
                      <User className="w-3 h-3 text-brand-400" />
                      <span>{mov.createdBy?.name || mov.user?.name || 'Warehouse Staff'}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-gray-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(mov.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <EditProductModal
        isOpen={isEditOpen}
        product={product}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <AdjustStockModal
        isOpen={isAdjustOpen}
        product={product}
        onClose={() => setIsAdjustOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
