import React, { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">StockX</span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Mini ERP + CRM Operations Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center text-xs text-gray-400 py-10">Loading portal...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
