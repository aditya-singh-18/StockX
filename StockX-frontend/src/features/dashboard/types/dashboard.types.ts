export interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalChallans: number;
  backendOnline: boolean;
}

export interface DashboardRecentChallan {
  id: string;
  challanNo: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  totalQty: number;
  totalAmount: number | string;
  createdAt: string;
  customer?: {
    name?: string;
    businessName?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    unitPrice: number | string;
    productNameSnapshot?: string;
  }>;
  _count?: {
    items: number;
  };
}
