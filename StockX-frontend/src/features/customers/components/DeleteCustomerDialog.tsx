'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { deleteCustomer } from '../services/customers.service';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteCustomerDialogProps {
  isOpen: boolean;
  customerId: string;
  customerName: string;
  onClose: () => void;
}

export function DeleteCustomerDialog({
  isOpen,
  customerId,
  customerName,
  onClose,
}: DeleteCustomerDialogProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { error } = await deleteCustomer(customerId);
    setLoading(false);

    if (error) {
      setErrorMessage(error);
      showToast(error, 'error');
    } else {
      showToast(`Customer "${customerName}" deleted successfully.`, 'success');
      onClose();
      router.push('/customers');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete Customer">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-3.5 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-200">Warning: Permanent Action</h4>
            <p className="mt-1 leading-relaxed text-red-300/90">
              Are you sure you want to delete customer record{' '}
              <strong className="text-white">{customerName}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 font-medium text-xs">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#323238] text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
