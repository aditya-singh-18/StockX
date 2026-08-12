'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { adjustStock } from '../services/inventory.service';
import { Product } from '../types/inventory.types';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

interface AdjustStockModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustStockModal({
  isOpen,
  product,
  onClose,
  onSuccess,
}: AdjustStockModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    quantity: number;
    type: 'IN' | 'OUT';
    source: 'MANUAL_ADJUSTMENT' | 'PURCHASE_RECEIVED' | 'DAMAGED' | 'RETURNED';
    note: string;
  }>({
    quantity: 1,
    type: 'IN',
    source: 'PURCHASE_RECEIVED',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (formData.quantity <= 0) {
      showToast('Quantity must be greater than 0.', 'error');
      return;
    }

    setLoading(true);
    const { error } = await adjustStock(product.id, {
      quantity: Number(formData.quantity),
      type: formData.type,
      source: formData.source,
      note: formData.note ? formData.note.trim() : undefined,
    });
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast(`Stock updated for ${product.name}!`, 'success');
      onSuccess();
      onClose();
      setFormData({
        quantity: 1,
        type: 'IN',
        source: 'PURCHASE_RECEIVED',
        note: '',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock: ${product?.name || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-[#1C1C20] border border-[#27272A] rounded-lg flex items-center justify-between text-gray-300 font-mono">
          <span>Current Stock:</span>
          <span className="font-bold text-white text-sm">{product?.currentStock ?? 0} units</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Adjustment Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-semibold focus:border-brand-500 focus:outline-none"
            >
              <option value="IN">+ Add Stock (Stock In)</option>
              <option value="OUT">- Remove Stock (Stock Out)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 font-medium mb-1">Operational Source / Reason</label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="PURCHASE_RECEIVED">PURCHASE_RECEIVED (Stock Received from Vendor)</option>
            <option value="DAMAGED">DAMAGED (Damaged / Expired Goods)</option>
            <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT (Audit Physical Count Correction)</option>
            <option value="RETURNED">RETURNED (Customer Return)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 font-medium mb-1">Notes / Audit Remarks</label>
          <textarea
            rows={2}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Audit notes or PO reference..."
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white placeholder:text-gray-500 focus:border-brand-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#323238] text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Stock Adjustment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
