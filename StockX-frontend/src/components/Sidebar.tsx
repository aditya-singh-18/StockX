'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ScrollText,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';
import { usePermissions } from '@/lib/use-permissions';
import { useAuth } from '@/lib/auth-context';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
}

const ALL_NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    requiredPermission: PERMISSIONS.CUSTOMER_READ,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    requiredPermission: PERMISSIONS.PRODUCT_READ,
  },
  {
    name: 'Challans',
    href: '/challans',
    icon: ScrollText,
    requiredPermission: PERMISSIONS.CHALLAN_READ,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredPermission: PERMISSIONS.USER_MANAGE,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, permissions } = usePermissions();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const visibleNavItems = React.useMemo(() => {
    return ALL_NAVIGATION_ITEMS.filter((item) => {
      if (!item.requiredPermission) return true;
      return hasPermission(permissions, item.requiredPermission);
    });
  }, [permissions]);

  const handleLogoutClick = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-brand-500/20 text-brand-300 border-brand-500/40';
      case 'Sales':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'Warehouse':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'Accounts':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      default:
        return 'bg-zinc-800 text-gray-300 border-zinc-700';
    }
  };

  return (
    <aside className="w-64 bg-[#111113] border-r border-[#27272A] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-[#27272A] gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight leading-none block">
              StockFlow
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-none block mt-0.5">
              Operations Portal
            </span>
          </div>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 font-semibold border border-brand-500/30 shadow-xs'
                    : 'text-gray-400 hover:bg-[#18181B] hover:text-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-gray-400'}`}
                  />
                  <span>{item.name}</span>
                </div>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#27272A] bg-[#0E0E10]">
        <div className="p-3 bg-[#141416] border border-[#27272A] rounded-lg mb-2 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-100 truncate">
              {user?.name || 'Authorized User'}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getRoleBadgeColor(
                user?.role,
              )}`}
            >
              {user?.role || 'Guest'}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate font-mono">{user?.email || 'user@test.com'}</p>
        </div>

        <button
          onClick={handleLogoutClick}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/40 transition-colors disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
