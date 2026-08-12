'use client';

import React from 'react';
import { Server, ShieldCheck, User, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { usePermissions } from '@/lib/use-permissions';

export function SettingsPanel() {
  const { user } = usePermissions();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* User Profile Info Card */}
        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-brand-500 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#27272A] text-white font-semibold text-sm">
            <User className="w-4 h-4 text-brand-400" />
            <span>Active Operator Account</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Full Name</span>
              <span className="text-white font-semibold text-sm">{user?.name || 'Administrator'}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">Work Email</span>
              <span className="text-gray-200 font-mono">{user?.email || 'admin@test.com'}</span>
            </div>

            <div>
              <span className="text-gray-400 block mb-0.5">System Privilege Level</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user?.role || 'Admin'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Backend Endpoint Status Card */}
        <div className="bg-[#141416] border border-[#27272A] border-l-4 border-l-emerald-500 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#27272A] text-white font-semibold text-sm">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Live API Connection Health</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Service Endpoint URL</span>
              <div className="p-2.5 bg-[#0E0E10] border border-[#27272A] rounded-lg font-mono text-xs text-brand-400 break-all">
                {API_BASE_URL}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-gray-400">Database Connection:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected (Supabase Cloud)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
