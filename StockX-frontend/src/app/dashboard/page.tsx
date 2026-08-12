import React from 'react';
import { cookies } from 'next/headers';
import {
  Users,
  Package,
  ScrollText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('stockflow_user')?.value;
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  // Fetch REAL metrics from live Render backend
  let customersCount = 0;
  let productsCount = 0;
  let lowStockCount = 0;
  let challansCount = 0;
  let recentChallans: any[] = [];
  let backendOnline = false;

  if (accessToken) {
    try {
      const [custRes, prodRes, lowStockRes, chalRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/customers?limit=1`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/products?limit=1`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/products?lowStock=true&limit=1`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE_URL}/challans?limit=5`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (custRes.status === 'fulfilled' && custRes.value) {
        customersCount = custRes.value.total ?? 0;
        backendOnline = true;
      }
      if (prodRes.status === 'fulfilled' && prodRes.value) {
        productsCount = prodRes.value.total ?? 0;
        backendOnline = true;
      }
      if (lowStockRes.status === 'fulfilled' && lowStockRes.value) {
        lowStockCount = lowStockRes.value.total ?? 0;
        backendOnline = true;
      }
      if (chalRes.status === 'fulfilled' && chalRes.value) {
        challansCount = chalRes.value.total ?? 0;
        recentChallans = chalRes.value.data ?? [];
        backendOnline = true;
      }
    } catch {
      backendOnline = false;
    }
  }

  const roleBadgeStyle =
    user?.role === 'Admin'
      ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
      : user?.role === 'Sales'
      ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
      : user?.role === 'Warehouse'
      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
      : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'Authorized User'}
            </h1>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${roleBadgeStyle}`}
            >
              {user?.role || 'Guest'} Role
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Logged in as <span className="font-mono text-gray-300">{user?.email}</span>
          </p>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs font-medium text-gray-300 shadow-sm w-fit">
          <span
            className={`w-2 h-2 rounded-full ${
              backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          ></span>
          <span>Live API:</span>
          <span className="font-mono text-gray-100 font-medium">stockx-7dz7.onrender.com</span>
        </div>
      </div>

      {/* Real Data Stat Cards (4 Real Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Customers */}
        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5 hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{customersCount}</div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Active CRM records</span>
            </p>
          </div>
        </div>

        {/* 2. Catalog Products */}
        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5 hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{productsCount}</div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
              <span>Managed SKUs & units</span>
            </p>
          </div>
        </div>

        {/* 3. Low-Stock Alerts */}
        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5 hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Low-Stock Alerts
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                lowStockCount > 0
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-zinc-800 border-zinc-700 text-gray-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-3xl font-bold ${
                lowStockCount > 0 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {lowStockCount}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  lowStockCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              ></span>
              <span>{lowStockCount > 0 ? 'Items below threshold' : 'All stock optimal'}</span>
            </p>
          </div>
        </div>

        {/* 4. Sales Challans */}
        <div className="bg-[#141416] border border-[#27272A] rounded-lg p-5 hover:border-[#3F3F46] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sales Challans
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ScrollText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white">{challansCount}</div>
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>Draft & Confirmed flows</span>
            </p>
          </div>
        </div>
      </div>

      {/* Real Recent Challans Section */}
      <div className="bg-[#141416] border border-[#27272A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-brand-400" />
              <span>Recent Sales Challans</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time fulfillment pipeline from our database.
            </p>
          </div>
          <a
            href="/dashboard/challans"
            className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {recentChallans.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No challans created yet. Go to Challans tab to create your first dispatch order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#27272A] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Challan #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Items / Qty</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {recentChallans.map((challan: any) => {
                  const statusStyle =
                    challan.status === 'CONFIRMED'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      : challan.status === 'CANCELLED'
                      ? 'bg-red-950/60 text-red-300 border-red-800/60'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/60';

                  return (
                    <tr key={challan.id} className="hover:bg-[#1A1A1E] transition-colors">
                      <td className="py-3 font-mono font-medium text-brand-400">
                        {challan.challanNo}
                      </td>
                      <td className="py-3 text-gray-200">
                        {challan.customer?.name || 'Customer'}
                      </td>
                      <td className="py-3 text-gray-400 font-mono">
                        {new Date(challan.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 text-gray-300 font-mono">
                        {challan.items?.length || 0} items ({challan.totalQty || 0} units)
                      </td>
                      <td className="py-3 font-mono text-gray-200">
                        ₹{(challan.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusStyle}`}
                        >
                          {challan.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic RBAC Capabilities Matrix */}
      <div className="bg-[#141416] border border-[#27272A] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <span>Granted Permissions & Active Role Matrix</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live authorization array governing UI buttons and backend endpoint access.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1C1C20] text-gray-300 border border-[#27272A] font-semibold">
            {user?.permissions?.length || 0} Active Capabilities
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {user?.permissions?.map((perm: string) => (
            <span
              key={perm}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0E0E10] border border-[#27272A] rounded-md text-xs font-mono text-gray-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
