'use client';

import React, { useState } from 'react';
import { Challan } from '../types/challans.types';
import { cancelChallan, getChallanById } from '../services/challans.service';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { ConfirmChallanDialog } from './ConfirmChallanDialog';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  PackageCheck,
  AlertCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

interface ChallanDetailCardProps {
  initialChallan: Challan;
}

export function ChallanDetailCard({ initialChallan }: ChallanDetailCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [challan, setChallan] = useState<Challan>(initialChallan);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleCancel = async () => {
    setCanceling(true);
    const { error } = await cancelChallan(challan.id);
    setCanceling(false);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast(`Challan ${challan.challanNo} cancelled.`, 'success');
      setChallan((prev) => ({ ...prev, status: 'CANCELLED' }));
      router.refresh();
    }
  };

  const handleConfirmSuccess = async () => {
    const res = await getChallanById(challan.id);
    if (res.data) {
      setChallan(res.data);
    } else {
      setChallan((prev) => ({ ...prev, status: 'CONFIRMED', confirmedAt: new Date().toISOString() }));
    }
    router.refresh();
  };

  const isDraft = challan.status === 'DRAFT';
  const isConfirmed = challan.status === 'CONFIRMED';

  const createdDateStr = new Date(challan.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const confirmedDateStr = challan.confirmedAt
    ? new Date(challan.confirmedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/challans"
            className="p-2 rounded-lg bg-[#141416] border border-[#27272A] text-gray-400 hover:text-white hover:border-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                {challan.challanNo}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                  isConfirmed
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : isDraft
                    ? 'bg-brand-500/15 text-brand-300 border-brand-500/40'
                    : 'bg-red-950/60 text-red-300 border-red-800/60'
                }`}
              >
                {challan.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-1.5">
              <span>Created by <strong className="text-gray-200">{challan.createdBy?.name || 'Sales Rep'}</strong> on {createdDateStr}</span>
              {isConfirmed && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-emerald-400 font-medium">
                    Confirmed by <strong className="text-emerald-300">{challan.confirmedBy?.name || challan.stockMovements?.[0]?.createdBy?.name || challan.createdBy?.name || 'Staff User'}</strong>
                    {confirmedDateStr ? ` on ${confirmedDateStr}` : ''}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {isDraft ? (
            <>
              <RequirePermission permission={PERMISSIONS.CHALLAN_CANCEL}>
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 transition-colors border border-red-800/60 disabled:opacity-50"
                >
                  {canceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <span>Cancel Challan</span>
                </button>
              </RequirePermission>

              <RequirePermission permission={PERMISSIONS.CHALLAN_CONFIRM}>
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Dispatch</span>
                </button>
              </RequirePermission>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#141416] border border-[#27272A] px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-brand-400" />
              <span>Challan is {challan.status.toLowerCase()} (locked)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Info Side Panel */}
        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 space-y-4 lg:col-span-1 shadow-sm">
          <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272A] flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            <span>Customer & Order Info</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Customer Name</span>
              <span className="text-white font-semibold text-sm block">
                {challan.customer?.name || '—'}
              </span>
              {challan.customer?.businessName && (
                <span className="text-gray-400 text-[11px]">
                  {challan.customer.businessName}
                </span>
              )}
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">Contact Mobile</span>
              <div className="flex items-center gap-2 text-gray-200 font-mono">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                <span>{challan.customer?.mobile || '—'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#27272A]">
              <span className="text-gray-400 block mb-0.5">Total Line Items</span>
              <span className="text-gray-200 font-mono font-medium">{challan.totalQty} total units</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">Total Amount</span>
              <span className="text-xl font-bold font-mono text-brand-400">
                ₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Created By & Date */}
            <div className="pt-2 border-t border-[#27272A]">
              <span className="text-gray-400 block mb-0.5">Created By</span>
              <div className="flex items-center gap-2 text-gray-300 font-mono">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {challan.createdBy?.name || 'Sales Rep'} • {createdDateStr}
                </span>
              </div>
            </div>

            {/* Confirmed By & Date (Shown if confirmed) */}
            {isConfirmed && (
              <div className="pt-2 border-t border-[#27272A] bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30">
                <span className="text-emerald-400 font-medium block mb-0.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Confirmed By</span>
                </span>
                <div className="text-emerald-200 font-mono text-[11px] mt-1 space-y-0.5">
                  <strong className="block text-emerald-300">
                    {challan.confirmedBy?.name || challan.stockMovements?.[0]?.createdBy?.name || challan.createdBy?.name || 'Staff User'}
                  </strong>
                  {(challan.confirmedBy?.email || challan.stockMovements?.[0]?.createdBy?.email) && (
                    <span className="block text-emerald-400/80 text-[10px]">
                      {challan.confirmedBy?.email || challan.stockMovements?.[0]?.createdBy?.email}
                    </span>
                  )}
                  {confirmedDateStr && <span className="block text-gray-400 text-[10px]">on {confirmedDateStr}</span>}
                </div>
              </div>
            )}

            {challan.notes && (
              <div className="pt-2 border-t border-[#27272A]">
                <span className="text-gray-400 block mb-0.5">Special Instructions / Notes</span>
                <p className="text-gray-300 leading-relaxed italic">{challan.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Snapshots Table */}
        <div className="lg:col-span-2 bg-[#141416] border border-[#27272A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-brand-400" />
              <span>Challan Item Snapshots</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {challan.items?.length || 0} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-brand-400/90 border-b border-brand-500/30 uppercase tracking-wider bg-brand-500/5">
                  <th className="py-2.5 px-3 font-semibold rounded-l">Item Description</th>
                  <th className="py-2.5 px-3 font-semibold">Quantity</th>
                  <th className="py-2.5 px-3 font-semibold">Unit Price</th>
                  <th className="py-2.5 px-3 font-semibold text-right rounded-r">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {challan.items?.map((item) => {
                  const lineTotal = Number(item.quantity) * Number(item.unitPriceSnapshot);
                  return (
                    <tr key={item.id} className="hover:bg-[#1A1A1E] transition-colors">
                      <td className="py-3 px-3 font-medium text-white">
                        {item.productNameSnapshot}
                      </td>
                      <td className="py-3 px-3 text-gray-200 font-mono font-semibold">
                        {item.quantity} units
                      </td>
                      <td className="py-3 px-3 text-gray-300 font-mono">
                        ₹{Number(item.unitPriceSnapshot).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmChallanDialog
        isOpen={isConfirmOpen}
        challanId={challan.id}
        challanNo={challan.challanNo}
        totalAmount={challan.totalAmount}
        onClose={() => setIsConfirmOpen(false)}
        onSuccess={handleConfirmSuccess}
      />
    </div>
  );
}
