import React from 'react';
import { cookies } from 'next/headers';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('stockflow_user')?.value;

  let initialUser = null;
  if (userCookie) {
    try {
      initialUser = JSON.parse(decodeURIComponent(userCookie));
    } catch {
      try {
        initialUser = JSON.parse(userCookie);
      } catch {
        initialUser = null;
      }
    }
  }

  return (
    <AuthProvider initialUser={initialUser}>
      <ToastProvider>
        <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex">
          {/* Dynamic Permission-Gated Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto min-h-screen bg-[#0A0A0B]">
            <div className="max-w-7xl mx-auto p-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
