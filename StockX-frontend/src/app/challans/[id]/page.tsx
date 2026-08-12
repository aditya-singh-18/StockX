import React from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { getChallanById } from '@/features/challans/services/challans.service';
import { ChallanDetailCard } from '@/features/challans/components/ChallanDetailCard';
import { notFound } from 'next/navigation';
import { getServerAuth } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

interface ChallanDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChallanDetailPage({ params }: ChallanDetailPageProps) {
  const resolvedParams = await params;
  const { accessToken } = await getServerAuth();

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
