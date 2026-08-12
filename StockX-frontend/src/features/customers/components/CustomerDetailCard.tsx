'use client';

import React, { useState } from 'react';
import { Customer, CustomerNote } from '../types/customers.types';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';
import { EditCustomerModal } from './EditCustomerModal';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { CustomerNotesTimeline } from './CustomerNotesTimeline';
import {
  User,
  Phone,
  Mail,
  Building,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import Link from 'next/link';

interface CustomerDetailCardProps {
  initialCustomer: Customer;
  initialNotes: CustomerNote[];
}

export function CustomerDetailCard({
  initialCustomer,
  initialNotes,
}: CustomerDetailCardProps) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] border border-[#27272A] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] text-gray-400 hover:text-white hover:border-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{customer.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase ${
                  customer.status === 'ACTIVE'
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                    : customer.status === 'LEAD'
                    ? 'bg-brand-500/15 text-brand-300 border-brand-500/40'
                    : 'bg-zinc-800 text-gray-400 border-zinc-700'
                }`}
              >
                {customer.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {customer.type}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>{customer.businessName || 'Individual Account'}</span>
              <span className="text-gray-600">•</span>
              <span className="font-mono text-gray-500">ID: {customer.id}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <RequirePermission permission={PERMISSIONS.CUSTOMER_UPDATE}>
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181B] hover:bg-[#222226] text-xs font-semibold text-gray-200 hover:text-white transition-colors border border-[#27272A]"
            >
              <Edit className="w-3.5 h-3.5 text-brand-400" />
              <span>Edit Profile</span>
            </button>
          </RequirePermission>

          <RequirePermission permission={PERMISSIONS.USER_MANAGE}>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 transition-colors border border-red-800/60"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete</span>
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* Two Column Layout: Customer Details Grid & Notes Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Grid (1 col on lg) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272A] flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" />
              <span>Customer Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5 text-xs">
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  Mobile Number
                </span>
                <div className="flex items-center gap-2 text-white font-mono font-medium text-sm">
                  <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{customer.mobile}</span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-gray-200 font-mono truncate">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{customer.email || '—'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  Business Name
                </span>
                <div className="flex items-center gap-2 text-gray-200 font-medium">
                  <Building className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{customer.businessName || '—'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  GSTIN Number
                </span>
                <div className="flex items-center gap-2 text-gray-200 font-mono">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{customer.gstNumber || '—'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  Follow-Up Date
                </span>
                <div className="flex items-center gap-2 text-amber-400 font-mono font-medium">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    {customer.followUpDate
                      ? new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Not scheduled'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                  Registered Date
                </span>
                <div className="flex items-center gap-2 text-gray-400 font-mono">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg text-xs">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
                Mailing Address
              </span>
              <div className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{customer.address || 'No address registered'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Component (2 cols on lg) */}
        <div className="lg:col-span-2">
          <CustomerNotesTimeline customerId={customer.id} initialNotes={initialNotes} />
        </div>
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditOpen}
        customer={customer}
        onClose={() => setIsEditOpen(false)}
        onSuccess={(updated) => setCustomer(updated)}
      />

      {/* Delete Customer Dialog */}
      <DeleteCustomerDialog
        isOpen={isDeleteOpen}
        customerId={customer.id}
        customerName={customer.name}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
