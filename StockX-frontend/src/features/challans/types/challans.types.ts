export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number | string;
  productNameSnapshot: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
  };
}

export interface Challan {
  id: string;
  challanNo: string;
  status: ChallanStatus;
  notes?: string | null;
  totalQty: number;
  totalAmount: number | string;
  createdAt: string;
  confirmedAt?: string | null;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    businessName?: string | null;
    mobile: string;
  };
  createdById?: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
  confirmedById?: string | null;
  confirmedBy?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  items?: ChallanItem[];
  stockMovements?: {
    id: string;
    quantity: number;
    type: string;
    source?: string;
    note?: string | null;
    createdAt: string;
    createdBy?: {
      id: string;
      name: string;
      email?: string;
    };
  }[];
  _count?: {
    items: number;
  };
}

export interface ChallanQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateChallanItemDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateChallanDto {
  customerId: string;
  notes?: string;
  items: CreateChallanItemDto[];
}
