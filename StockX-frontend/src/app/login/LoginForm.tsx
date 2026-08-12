'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@test.com', label: '👑 Admin (Full Access)' },
  { role: 'Sales', email: 'sales@test.com', label: '💼 Sales (CRM & Challans)' },
  { role: 'Warehouse', email: 'warehouse@test.com', label: '🏭 Warehouse (Inventory)' },
  { role: 'Accounts', email: 'accounts@test.com', label: '📊 Accounts (Reports)' },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams ? (searchParams.get('redirect') || '/dashboard') : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Test@1234');
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#141416] py-8 px-6 sm:px-10 border border-[#27272A] rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-white mb-6">
        Sign in to your workspace
      </h2>

      {error && (
        <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start gap-2.5 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#0E0E10] border border-[#27272A] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#0E0E10] border border-[#27272A] rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Test Accounts */}
      <div className="mt-8 pt-6 border-t border-[#27272A]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Demo Accounts (Click to Fill)
          </span>
          <span className="text-xs text-gray-500 font-mono">Test@1234</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleQuickFill(acc.email)}
              className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                email === acc.email
                  ? 'border-brand-500 bg-brand-500/10 text-brand-400 font-medium'
                  : 'border-[#27272A] bg-[#0E0E10] hover:bg-[#1A1A1E] text-gray-300'
              }`}
            >
              <div className="font-medium truncate">{acc.label}</div>
              <div className="text-[11px] text-gray-500 truncate font-mono mt-0.5">
                {acc.email}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
