import React, { Suspense } from 'react';
import { Shield } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { API_BASE_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  let displayHost = API_BASE_URL;
  try {
    displayHost = new URL(API_BASE_URL).host;
  } catch {
    displayHost = API_BASE_URL;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">StockFlow</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Mini ERP + CRM Operations Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center text-xs text-gray-400 py-10">Loading portal...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Connected to API:</span>
            <span className="font-mono text-gray-200 font-medium">{displayHost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
