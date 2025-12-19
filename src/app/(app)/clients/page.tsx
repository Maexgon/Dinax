'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { Client, ClientPlan, ServicePlan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { collection } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import React, { useMemo } from 'react';

function ClientCardSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center">
                <Skeleton className="h-20 w-20 rounded-full" />
            </CardHeader>
            <CardContent className="flex-grow text-center space-y-2">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full mx-auto" />
                <div className="mt-4 pt-4">
                    <Skeleton className="h-2 w-1/2 mx-auto mb-1" />
                    <Skeleton className="h-2 w-full mx-auto" />
                    <Skeleton className="h-3 w-1/4 mx-auto mt-1" />
                </div>
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}


export default function ClientsPage() {
  const { t } = useLanguage();
  const { firestore, user } = useFirebase();

  const tenantId = user?.uid;
  
  const clientsRef = useMemoFirebase(() => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null), [tenantId, firestore]);
  const clientPlansRef = useMemoFirebase(() => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/client_plans`) : null), [tenantId, firestore]);
  const servicePlansRef = useMemoFirebase(() => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/services`) : null), [tenantId, firestore]);

  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsRef);
  const { data: clientPlans, isLoading: areClientPlansLoading } = useCollection<ClientPlan>(clientPlansRef);
  const { data: servicePlans, isLoading: areServicePlansLoading } = useCollection<ServicePlan>(servicePlansRef);

  const isLoading = areClientsLoading || areClientPlansLoading || areServicePlansLoading;
  
  const enrichedClients = useMemo(() => {
    if (isLoading || !clients || !clientPlans || !servicePlans) return [];

    return clients.map(client => {
      const clientPlan = clientPlans.find(cp => cp.clientId === client.id);
      const servicePlan = clientPlan ? servicePlans.find(sp => sp.id === clientPlan.servicePlanId) : null;

      return {
        ...client,
        servicePlanName: servicePlan?.name || null,
      };
    });
  }, [clients, clientPlans, servicePlans, isLoading]);


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">{t.clients.title}</h1>
            <p className="text-muted-foreground">{t.clients.description}</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/clients/assign-plan">
                    <LinkIcon className="mr-2 h-4 w-4" /> {t.clients.assignCommercialPlan}
                </Link>
            </Button>
            <Button asChild>
                <Link href="/clients/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t.clients.addNewClient}
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <ClientCardSkeleton key={i} />)}
        
        {!isLoading && enrichedClients?.map((client) => {
          const planTypeLabel = t.clientDetail.planTypes.find(p => p.value === client.planType)?.label;
          return (
            <Card key={client.id} className="flex flex-col">
              <CardHeader className="items-center">
                <Image
                  src={client.avatarUrl || `https://i.pravatar.cc/80?u=${client.id}`}
                  alt={`Avatar of ${client.name}`}
                  data-ai-hint={client.avatarHint || 'person face'}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-primary"
                />
              </CardHeader>
              <CardContent className="flex-grow text-center">
                <CardTitle className="font-headline">{client.name}</CardTitle>
                 {client.servicePlanName && <Badge variant="secondary" className="mt-1">{client.servicePlanName}</Badge>}
                <CardDescription className="mt-1">{client.email}</CardDescription>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t.clients.planProgress}
                  </p>
                  <Progress value={client.progress || 0} className="h-2" />
                  <p className="text-xs text-accent mt-1">{client.progress || 0}{t.clients.complete}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/clients/${client.id}`}>{t.clients.viewProfile}</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
