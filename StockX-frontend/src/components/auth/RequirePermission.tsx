'use client';

import React from 'react';
import { usePermissions } from '@/lib/use-permissions';
import { PermissionKey } from '@/lib/permissions';

export interface RequirePermissionProps {
  permission: PermissionKey | PermissionKey[];
  mode?: 'ALL' | 'ANY';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable Permission-Gated Wrapper Component
 * Renders `children` only if the active authenticated user holds the required permissions.
 * Otherwise, renders `fallback` (defaults to null).
 *
 * Example Usage:
 * <RequirePermission permission="customer:create">
 *   <button onClick={openCreateModal}>+ Add Customer</button>
 * </RequirePermission>
 */
export function RequirePermission({
  permission,
  mode = 'ALL',
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  const allowed = hasPermission(permission, mode);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RequirePermission;
