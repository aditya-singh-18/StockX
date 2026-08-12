export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  unitPrice: number | string;
  currentStock: number;
  minStock: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
  _count?: {
    stockMovements: number;
    challanItems: number;
  };
}

export interface ProductQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductDto {
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock?: number;
  minStock?: number;
  location?: string;
}

export interface AdjustStockDto {
  quantity: number;
  type: 'IN' | 'OUT';
  reason: 'PURCHASE' | 'DAMAGE' | 'AUDIT_CORRECTION' | 'RETURN' | 'OTHER';
  notes?: string;
}
