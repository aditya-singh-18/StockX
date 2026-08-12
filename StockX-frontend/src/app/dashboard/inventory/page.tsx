import React from 'react';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-brand-400" />
            <span>Products & Inventory</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Product catalog, real-time stock levels, low-stock threshold alerts, and atomic stock movements.
          </p>
        </div>
      </div>

      <div className="bg-[#141416] border border-[#27272A] rounded-lg p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-3">
          <Package className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Inventory Module Ready</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
          Dark theme and route protection active. Next step will render product table, low-stock badges, and inward/outward adjustment modal.
        </p>
      </div>
    </div>
  );
}
