'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/lib/api';
import { hasPermission, PermissionKey } from '@/lib/permissions';

interface AuthContextType {
  user: UserSession | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (required: PermissionKey | PermissionKey[], mode?: 'ALL' | 'ANY') => boolean;
  logout: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: UserSession | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      // Fetch session from client cookie / profile
      try {
        const match = document.cookie
          .split('; ')
          .find((row) => row.startsWith('stockflow_user='));
        if (match) {
          const cookieVal = decodeURIComponent(match.split('=')[1]);
          setUser(JSON.parse(cookieVal));
        }
      } catch (err) {
        console.error('Failed to parse user session cookie:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [initialUser]);

  const permissions = useMemo(() => user?.permissions || [], [user]);

  const checkPermission = (
    required: PermissionKey | PermissionKey[],
    mode: 'ALL' | 'ANY' = 'ALL',
  ) => {
    return hasPermission(permissions, required, mode);
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      isLoading,
      hasPermission: checkPermission,
      logout,
      setUser,
    }),
    [user, permissions, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
