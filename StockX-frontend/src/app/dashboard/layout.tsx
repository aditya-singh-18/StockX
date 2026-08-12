import React from 'react';
import { cookies } from 'next/headers';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('stockflow_user')?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex">
      {/* 5-Item Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
