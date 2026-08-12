'use client';

import { useAuth } from '@/lib/auth-context';
import { hasPermission as checkPermission, PermissionKey } from '@/lib/permissions';

/**
 * Custom React Hook: usePermissions
 * Reads the current user's permissions array from auth context
 * Provides reactive helpers to check permissions without hardcoding role names.
 */
export function usePermissions() {
  const { permissions, user, isLoading } = useAuth();

  const can = (permission: PermissionKey | PermissionKey[], mode: 'ALL' | 'ANY' = 'ALL'): boolean => {
    return checkPermission(permissions, permission, mode);
  };

  const hasAll = (...perms: PermissionKey[]): boolean => {
    return checkPermission(permissions, perms, 'ALL');
  };

  const hasAny = (...perms: PermissionKey[]): boolean => {
    return checkPermission(permissions, perms, 'ANY');
  };

  return {
    permissions,
    user,
    isLoading,
    hasPermission: can,
    can,
    hasAll,
    hasAny,
  };
}
