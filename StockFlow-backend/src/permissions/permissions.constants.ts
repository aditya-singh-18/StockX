export enum PermissionKey {
  // Customer CRM
  CUSTOMER_CREATE = 'customer:create',
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',

  // Product & Inventory
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_STOCK_ADJUST = 'product:stock-adjust',

  // Sales Challan
  CHALLAN_CREATE = 'challan:create',
  CHALLAN_READ = 'challan:read',
  CHALLAN_CONFIRM = 'challan:confirm',
  CHALLAN_CANCEL = 'challan:cancel',

  // User Management
  USER_MANAGE = 'user:manage',
}

export interface PermissionDefinition {
  key: PermissionKey | string;
  description: string;
  module: 'customers' | 'products' | 'challans' | 'users';
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  { key: PermissionKey.CUSTOMER_CREATE, description: 'Create new customer records', module: 'customers' },
  { key: PermissionKey.CUSTOMER_READ, description: 'View customer details and lists', module: 'customers' },
  { key: PermissionKey.CUSTOMER_UPDATE, description: 'Update customer profiles and notes', module: 'customers' },

  { key: PermissionKey.PRODUCT_CREATE, description: 'Create new catalog products', module: 'products' },
  { key: PermissionKey.PRODUCT_READ, description: 'View product catalog and stock levels', module: 'products' },
  { key: PermissionKey.PRODUCT_UPDATE, description: 'Edit product details and pricing', module: 'products' },
  { key: PermissionKey.PRODUCT_STOCK_ADJUST, description: 'Perform manual stock adjustments IN/OUT', module: 'products' },

  { key: PermissionKey.CHALLAN_CREATE, description: 'Create and draft sales challans', module: 'challans' },
  { key: PermissionKey.CHALLAN_READ, description: 'View sales challans and dispatch lists', module: 'challans' },
  { key: PermissionKey.CHALLAN_CONFIRM, description: 'Confirm challans and atomically deduct inventory', module: 'challans' },
  { key: PermissionKey.CHALLAN_CANCEL, description: 'Cancel sales challans', module: 'challans' },

  { key: PermissionKey.USER_MANAGE, description: 'Manage team users and assign roles', module: 'users' },
];
