/**
 * Permission Keys corresponding to backend DB permissions
 */
export const PERMISSIONS = {
  // Customers CRM
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_UPDATE: 'customer:update',

  // Products & Inventory
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_STOCK_ADJUST: 'product:stock-adjust',

  // Sales Challans
  CHALLAN_CREATE: 'challan:create',
  CHALLAN_READ: 'challan:read',
  CHALLAN_CONFIRM: 'challan:confirm',
  CHALLAN_CANCEL: 'challan:cancel',

  // System & Users
  USER_MANAGE: 'user:manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | string;

/**
 * Pure helper function to verify if a user has a specific permission or set of permissions.
 * ZERO hardcoded role checks — 100% permission-driven.
 */
export function hasPermission(
  userPermissions: string[] | null | undefined,
  requiredPermission: PermissionKey | PermissionKey[],
  mode: 'ALL' | 'ANY' = 'ALL',
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false;
  }

  if (Array.isArray(requiredPermission)) {
    if (requiredPermission.length === 0) return true;
    if (mode === 'ANY') {
      return requiredPermission.some((perm) => userPermissions.includes(perm));
    }
    return requiredPermission.every((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(requiredPermission);
}
