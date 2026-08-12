import React from 'react';
import { Users, UserPlus } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            <span>Customers CRM</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage customer profiles, GST records, follow-up timeline notes, and contact details.
          </p>
        </div>
      </div>

      <div className="bg-[#141416] border border-[#27272A] rounded-lg p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white">Customers CRM Module Ready</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
          Dark theme and route protection active. Next step will render the customer table, search filters, and follow-up notes drawer.
        </p>
      </div>
    </div>
  );
}
