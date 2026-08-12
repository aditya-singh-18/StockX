import React from 'react';
import { Settings, Shield, Server } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>Portal Settings & System Health</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            System configuration, active API connection endpoints, and security posture.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5">
          <div className="flex items-center gap-2.5 mb-3 text-white font-semibold">
            <Server className="w-5 h-5 text-brand-400" />
            <h3>Backend API Endpoint</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Live backend service connecting to Supabase Cloud Postgres.
          </p>
          <div className="p-3 bg-[#0E0E10] border border-[#27272A] rounded-md font-mono text-xs text-brand-400 break-all">
            {API_BASE_URL}
          </div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5">
          <div className="flex items-center gap-2.5 mb-3 text-white font-semibold">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3>Auth & Security Architecture</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Session token handling & cookie parameters.
          </p>
          <ul className="text-xs space-y-1.5 text-gray-300">
            <li>• Access Token: 15-Minute Short-Lived JWT (httpOnly)</li>
            <li>• Refresh Token: 7-Day Single-Use Token Rotation (httpOnly)</li>
            <li>• RBAC Guard: Dynamic Capabilities Matrix (Zero Hardcoding)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
