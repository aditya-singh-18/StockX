'use client';

import React, { useState } from 'react';
import { Customer } from '@/features/customers/types/customers.types';
import { Product } from '@/features/inventory/types/inventory.types';
import { createChallan } from '../services/challans.service';
import { CreateChallanItemDto } from '../types/challans.types';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { ScrollText, Plus, Trash2, ArrowLeft, Loader2, User, Package } from 'lucide-react';
import Link from 'next/link';

interface CreateChallanFormProps {
  customers: Customer[];
  products: Product[];
}

export function CreateChallanForm({ customers, products }: CreateChallanFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateChallanItemDto[]>([
    { productId: products[0]?.id || '', quantity: 1, unitPrice: Number(products[0]?.unitPrice || 0) },
  ]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems((prev) => [
      ...prev,
      { productId: products[0].id, quantity: 1, unitPrice: Number(products[0].unitPrice || 0) },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              productId,
              unitPrice: prod ? Number(prod.unitPrice) : item.unitPrice,
            }
          : item,
      ),
    );
  };

  const handleQtyChange = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  };

  const handlePriceChange = (index: number, unitPrice: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unitPrice: Math.max(0, unitPrice) } : item)),
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      showToast('Please select a customer for this delivery challan.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Add at least one product item to the challan.', 'error');
      return;
    }

    setLoading(true);
    const { data, error } = await createChallan({
      customerId,
      notes: notes || undefined,
      items,
    });
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else if (data) {
      showToast(`Challan ${data.challanNo} created successfully!`, 'success');
      router.push(`/challans/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/challans"
            className="p-2 rounded-lg bg-[#141416] border border-[#27272A] text-gray-400 hover:text-white hover:border-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-brand-400" />
              <span>Create Delivery Challan</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Draft a new multi-product sales challan for dispatch.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 font-semibold text-xs text-white transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>Save Draft Challan</span>
        </button>
      </div>

      {/* Customer Selection */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 space-y-4 shadow-sm text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" />
          <span>Customer & Delivery Details</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Select Customer <span className="text-brand-400">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white font-medium focus:border-brand-500 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.businessName ? `(${c.businessName})` : ''} - {c.mobile}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Special Notes / PO Reference</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivery terms or PO-9872"
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white placeholder:text-gray-500 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-[#141416] border border-[#27272A] rounded-xl p-5 space-y-4 shadow-sm text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            <span>Challan Products & Quantities</span>
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#323238] text-xs font-semibold text-brand-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item Row</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center p-3 bg-[#1C1C20] border border-[#27272A] rounded-lg"
              >
                <div className="col-span-5">
                  <label className="block text-[11px] text-gray-400 mb-1">Product SKU</label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-white font-medium focus:border-brand-500 focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - Stock: {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-gray-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(index, parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-gray-400 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-white font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 text-right">
                  <span className="block text-[11px] text-gray-400 mb-1">Line Total</span>
                  <span className="font-mono font-bold text-white text-xs">
                    ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Summary Footer */}
        <div className="pt-3 border-t border-[#27272A] flex items-center justify-between font-mono">
          <span className="text-gray-400 text-xs font-semibold uppercase">Total Estimated Value:</span>
          <span className="text-xl font-bold text-brand-400">
            ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </form>
  );
}
