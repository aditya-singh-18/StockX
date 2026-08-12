import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import {
  getCustomerById,
  getCustomerNotes,
} from '@/features/customers/services/customers.service';
import { CustomerDetailCard } from '@/features/customers/components/CustomerDetailCard';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  const [{ data: customer }, { data: notes }] = await Promise.all([
    getCustomerById(resolvedParams.id, accessToken),
    getCustomerNotes(resolvedParams.id, accessToken),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <PortalLayout>
      <CustomerDetailCard initialCustomer={customer} initialNotes={notes || []} />
    </PortalLayout>
  );
}
