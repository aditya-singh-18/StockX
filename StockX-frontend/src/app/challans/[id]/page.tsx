import React from 'react';
import { cookies } from 'next/headers';
import PortalLayout from '@/components/layout/PortalLayout';
import { getChallanById } from '@/features/challans/services/challans.service';
import { ChallanDetailCard } from '@/features/challans/components/ChallanDetailCard';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ChallanDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChallanDetailPage({ params }: ChallanDetailPageProps) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('stockflow_access_token')?.value;

  const { data: challan } = await getChallanById(resolvedParams.id, accessToken);

  if (!challan) {
    notFound();
  }

  return (
    <PortalLayout>
      <ChallanDetailCard initialChallan={challan} />
    </PortalLayout>
  );
}
