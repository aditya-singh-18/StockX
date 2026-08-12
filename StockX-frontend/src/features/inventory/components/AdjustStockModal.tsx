'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { adjustStock } from '../services/inventory.service';
import { Product, AdjustStockDto } from '../types/inventory.types';
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

  const [formData, setFormData] = useState<AdjustStockDto>({
    quantity: 1,
    type: 'IN',
    reason: 'PURCHASE',
    notes: '',
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
      ...formData,
      quantity: Number(formData.quantity),
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
        reason: 'PURCHASE',
        notes: '',
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
          <label className="block text-gray-300 font-medium mb-1">Reason Code</label>
          <select
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="PURCHASE">PURCHASE (Stock Received)</option>
            <option value="DAMAGE">DAMAGE (Damaged / Expired)</option>
            <option value="AUDIT_CORRECTION">AUDIT_CORRECTION (Physical Stock Count)</option>
            <option value="RETURN">RETURN (Customer Return)</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 font-medium mb-1">Notes / Remarks</label>
          <textarea
            rows={2}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
