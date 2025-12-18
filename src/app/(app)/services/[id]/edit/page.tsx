'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import ServicePlanForm from '../../../services/service-plan-form';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ServicePlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditServicePlanPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const { firestore, user } = useFirebase();
  const tenantId = user?.uid;

  const planDocRef = useMemoFirebase(
    () => (firestore && tenantId && planId ? doc(firestore, `tenants/${tenantId}/services`, planId) : null),
    [firestore, tenantId, planId]
  );
  const { data: existingPlan, isLoading } = useDoc<ServicePlan>(planDocRef);
  
  if(isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <a onClick={() => router.push('/services')} className="hover:text-primary transition-colors cursor-pointer">{t.nav.services}</a>
        <span>/</span>
        <span>{existingPlan?.name || t.services.editTitle}</span>
      </div>
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{t.services.editTitle}</h1>
        <p className="text-muted-foreground max-w-2xl">{t.services.description}</p>
      </div>
      <ServicePlanForm existingPlan={existingPlan} />
    </div>
  );
}
