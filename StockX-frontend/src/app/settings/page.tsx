import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { SettingsPanel } from '@/features/settings/components/SettingsPanel';
import { Settings, ShieldAlert } from 'lucide-react';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default function SettingsRoute() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>Settings & System Health</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            System configuration, live API endpoints, and permission architecture.
          </p>
        </div>

        <RequirePermission
          permission={PERMISSIONS.USER_MANAGE}
          fallback={
            <div className="bg-[#141416] border border-red-900/40 rounded-lg p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Access Restricted</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                You do not possess the <code className="text-red-300 font-mono">user:manage</code> capability required to access system settings.
              </p>
            </div>
          }
        >
          <SettingsPanel />
        </RequirePermission>
      </div>
    </PortalLayout>
  );
}
