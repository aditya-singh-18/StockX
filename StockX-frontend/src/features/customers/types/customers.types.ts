export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  type: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
    challans: number;
  };
}

export interface CustomerQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  type?: CustomerType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerDto {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  type?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
}

export interface CustomerNote {
  id: string;
  note: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
