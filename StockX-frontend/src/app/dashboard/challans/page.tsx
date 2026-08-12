import React from 'react';
import { ScrollText } from 'lucide-react';

export default function ChallansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ScrollText className="w-6 h-6 text-brand-400" />
            <span>Sales Challans</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create draft orders, auto-generate sequential numbers, and confirm fulfillment with atomic stock deduction.
          </p>
        </div>
      </div>

      <div className="bg-[#141416] border border-[#27272A] rounded-lg p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-3">
          <ScrollText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Sales Challans Module Ready</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
          Dark theme and route protection active. Next step will render draft creation form, multi-product line items, and atomic confirm modal.
        </p>
      </div>
    </div>
  );
}
