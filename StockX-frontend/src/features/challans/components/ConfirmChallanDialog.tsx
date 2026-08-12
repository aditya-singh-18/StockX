'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { confirmChallan } from '../services/challans.service';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ConfirmChallanDialogProps {
  isOpen: boolean;
  challanId: string;
  challanNo: string;
  totalAmount: number | string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConfirmChallanDialog({
  isOpen,
  challanId,
  challanNo,
  totalAmount,
  onClose,
  onSuccess,
}: ConfirmChallanDialogProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const { error } = await confirmChallan(challanId);
    setLoading(false);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast(`Challan ${challanNo} confirmed! Stock inventory deducted.`, 'success');
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delivery Challan Execution">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-200 text-sm">Execute Stock Deduction</h4>
            <p className="mt-1 leading-relaxed text-emerald-300/90">
              Confirming challan <strong className="text-white font-mono">{challanNo}</strong> (Total Value:{' '}
              <strong className="text-white font-mono">
                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              ) will automatically deduct physical product quantities from warehouse inventory.
            </p>
          </div>
        </div>

        <div className="p-3 bg-[#1C1C20] border border-[#27272A] rounded-lg text-gray-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-400 shrink-0" />
          <span>This action transitions the draft into a locked, confirmed state.</span>
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
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm & Dispatch Stock</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
