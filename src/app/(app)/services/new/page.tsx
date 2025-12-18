'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ServicePlanForm from '../service-plan-form';
import { useLanguage } from '@/context/language-context';

export default function NewServicePlanPage() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <a onClick={() => router.push('/services')} className="hover:text-primary transition-colors cursor-pointer">{t.nav.services}</a>
            <span>/</span>
            <span>{t.services.newTitle}</span>
        </div>
        <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">{t.services.newTitle}</h1>
            <p className="text-muted-foreground max-w-2xl">{t.services.description}</p>
        </div>
        <ServicePlanForm />
    </div>
  );
}
