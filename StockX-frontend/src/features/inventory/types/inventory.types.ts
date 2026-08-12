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
  minStock?: number;
  location?: string;
  initialStock?: number;
}

export interface AdjustStockDto {
  quantity: number;
  type: 'IN' | 'OUT';
  source?: 'MANUAL_ADJUSTMENT' | 'PURCHASE_RECEIVED' | 'DAMAGED' | 'RETURNED' | 'CHALLAN_CONFIRMED' | 'CHALLAN_CANCELLED_REVERSAL';
  note?: string;
}
