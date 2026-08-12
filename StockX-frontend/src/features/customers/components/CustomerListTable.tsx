'use client';

import React, { useState } from 'react';
import { Customer } from '../types/customers.types';
import { Users, Phone, Mail, Clock, Eye, ArrowUpRight } from 'lucide-react';
import { CustomerSearchFilter } from './CustomerSearchFilter';
import { AddCustomerModal } from './AddCustomerModal';
import { useRouter } from 'next/navigation';

interface CustomerListTableProps {
  initialCustomers: Customer[];
  total: number;
}

export function CustomerListTable({ initialCustomers, total }: CustomerListTableProps) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleRowClick = (id: string) => {
    router.push(`/customers/${id}`);
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Toolbar */}
      <CustomerSearchFilter onAddClick={() => setIsAddOpen(true)} />

      {/* Customer List Card */}
      <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-400" />
              <span>Customer Directory</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing {initialCustomers.length} of {total} registered customer records.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-brand-400/90 border-b border-brand-500/30 uppercase tracking-wider bg-brand-500/5">
                <th className="py-2.5 px-3 font-semibold rounded-l">Customer Name</th>
                <th className="py-2.5 px-3 font-semibold">Business</th>
                <th className="py-2.5 px-3 font-semibold">Contact Details</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Follow-Up</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-r">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]">
              {initialCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 italic">
                    No matching customer records found.
                  </td>
                </tr>
              ) : (
                initialCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleRowClick(customer.id)}
                    className="hover:bg-[#1A1A1E] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-semibold text-white group-hover:text-brand-300">
                      <div className="flex items-center gap-1.5">
                        <span>{customer.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500 group-hover:text-brand-400 transition-colors" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-medium">
                      {customer.businessName || '—'}
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Phone className="w-3 h-3 text-brand-400" />
                        <span>{customer.mobile}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#1C1C20] text-gray-300 border border-[#27272A]">
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          customer.status === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : customer.status === 'LEAD'
                            ? 'bg-brand-500/15 text-brand-300 border-brand-500/40'
                            : 'bg-zinc-800 text-gray-400 border-zinc-700'
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 font-mono">
                      {customer.followUpDate ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(customer.followUpDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(customer.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#27272A]/80 hover:bg-brand-500 hover:text-white text-gray-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
