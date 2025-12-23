
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { ServicePlan } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

function ServicePlanRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24 mt-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  );
}

export default function ServicePlansListPage() {
  const { t } = useLanguage();
  const { firestore, user } = useFirebase();
  const tenantId = user?.uid;

  const servicesCollectionRef = useMemoFirebase(
    () =>
      firestore && tenantId
        ? query(
            collection(firestore, `tenants/${tenantId}/services`),
            orderBy('name')
          )
        : null,
    [firestore, tenantId]
  );

  const { data: servicePlans, isLoading } =
    useCollection<ServicePlan>(servicesCollectionRef);

  const currencySymbols: { [key: string]: string } = {
    usd: '$',
    eur: '€',
    ars: '$',
  };
  
  const frequencyLabels: { [key: string]: string } = {
    weekly: t.services.weekly,
    monthly: t.services.monthly,
    quarterly: t.services.quarterly,
    semiannually: t.services.semiannually,
    annually: t.services.annually,
    once: t.services.once,
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            {t.nav.services}
          </h1>
          <p className="text-muted-foreground">{t.payments.manageServices}</p>
        </div>
        <Button asChild>
          <Link href="/services/new">
            <PlusCircle className="mr-2 h-4 w-4" />{' '}
            {t.services.createNewPlan}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes Creados</CardTitle>
          <CardDescription>
            Aquí puedes ver y gestionar todos tus planes de servicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Plan</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Promoción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <ServicePlanRowSkeleton key={i} />
                ))}
              {!isLoading &&
                servicePlans?.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {plan.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        {currencySymbols[plan.currency] || '$'}
                        {plan.price.toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      {frequencyLabels[plan.frequency] || plan.frequency}
                    </TableCell>
                    <TableCell>
                      {plan.hasPromo ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">Sí</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/services/${plan.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
           {!isLoading && servicePlans?.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Aún no has creado ningún plan de servicio.</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/services/new">Crea tu primer plan</Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    