'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { updateCustomer } from '../services/customers.service';
import { Customer, CreateCustomerDto } from '../types/customers.types';
import { useToast } from '@/components/ui/Toast';
import { Loader2 } from 'lucide-react';

interface EditCustomerModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSuccess: (updated: Customer) => void;
}

export function EditCustomerModal({
  isOpen,
  customer,
  onClose,
  onSuccess,
}: EditCustomerModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    type: 'RETAIL',
    address: '',
    status: 'LEAD',
    followUpDate: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        type: customer.type || 'RETAIL',
        address: customer.address || '',
        status: customer.status || 'LEAD',
        followUpDate: customer.followUpDate ? customer.followUpDate.split('T')[0] : '',
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    if (!formData.name || !formData.mobile) {
      showToast('Name and Mobile number are required.', 'error');
      return;
    }

    setLoading(true);
    const { data, error } = await updateCustomer(customer.id, {
      ...formData,
      email: formData.email || undefined,
      businessName: formData.businessName || undefined,
      gstNumber: formData.gstNumber || undefined,
      address: formData.address || undefined,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
    });
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else if (data) {
      showToast(`Customer "${data.name}" updated successfully!`, 'success');
      onSuccess(data);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer Profile">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Customer Name <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">
              Mobile Number <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Business Name</label>
            <input
              type="text"
              value={formData.businessName || ''}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="RETAIL">RETAIL</option>
              <option value="WHOLESALE">WHOLESALE</option>
              <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber || ''}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 font-medium mb-1">Follow-Up Date</label>
          <input
            type="date"
            value={formData.followUpDate || ''}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 font-medium mb-1">Address</label>
          <textarea
            rows={2}
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-[#1C1C20] border border-[#27272A] rounded-lg text-white focus:border-brand-500 focus:outline-none resize-none"
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
            <span>Update Customer</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
