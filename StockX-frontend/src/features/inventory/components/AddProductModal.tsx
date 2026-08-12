'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { createProduct } from '../services/inventory.service';
import { CreateProductDto } from '../types/inventory.types';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStock: 10,
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      showToast('Product Name and SKU are required.', 'error');
      return;
    }

    setLoading(true);
    const { data, error } = await createProduct({
      ...formData,
      unitPrice: Number(formData.unitPrice),
      currentStock: Number(formData.currentStock),
      minStock: Number(formData.minStock),
    });
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast(`Product "${data?.name}" created successfully!`, 'success');
      onSuccess();
      onClose();
      setFormData({
        name: '',
        sku: '',
        category: '',
        unitPrice: 0,
        currentStock: 0,
        minStock: 10,
        location: '',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Inventory Product">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Product Name <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Industrial Steel Pipe 2 inch"
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              SKU Code <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. PIP-STL-002"
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Category</label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Raw Materials"
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Unit Price (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Initial Stock</label>
            <input
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Min Alert Stock</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Warehouse Bin</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. A1-B3"
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>
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
            <span>Save Product</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
