import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import {
  getCustomerById,
  getCustomerNotes,
} from '@/features/customers/services/customers.service';
import { CustomerDetailCard } from '@/features/customers/components/CustomerDetailCard';
import { notFound } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const resolvedParams = await params;
  const { accessToken } = await getServerAuth();

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
