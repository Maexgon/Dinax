'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit, CreditCard, CheckCircle, Search, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, query } from 'firebase/firestore';
import type { ServicePlan, Client } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type WorkingDay = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb';
const weekdays: WorkingDay[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const assignPlanSchema = z.object({
  servicePlanId: z.string().min(1, "Debes seleccionar un plan."),
  clientId: z.string().min(1, "Debes seleccionar un cliente."),
  trainingDays: z.array(z.string()).min(1, "Selecciona al menos un día."),
  hoursPerClass: z.coerce.number().min(0.5, "Debe ser al menos 0.5 horas."),
  monthlyCost: z.coerce.number().min(0, "El costo no puede ser negativo."),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
});

type AssignPlanFormData = z.infer<typeof assignPlanSchema>;

export default function AssignPlanPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  const tenantId = user?.uid;

  const { data: servicePlans, isLoading: arePlansLoading } = useCollection<ServicePlan>(
    useMemoFirebase(
      () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/services`)) : null),
      [firestore, tenantId]
    )
  );

  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(
    useMemoFirebase(
      () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/user_profile`)) : null),
      [firestore, tenantId]
    )
  );

  const filteredClients = useMemo(() => {
    return clients?.filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clients, searchQuery]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignPlanFormData>({
    resolver: zodResolver(assignPlanSchema),
    defaultValues: {
      trainingDays: [],
      hoursPerClass: 1,
      paymentMethod: 'cash',
    }
  });

  const watchClientId = watch('clientId');
  const watchServicePlanId = watch('servicePlanId');

  const selectedPlan = useMemo(() => {
    return servicePlans?.find(p => p.id === watchServicePlanId);
  }, [servicePlans, watchServicePlanId]);
  
  const selectedClient = useMemo(() => {
    return clients?.find(c => c.id === watchClientId);
  }, [clients, watchClientId]);

  // Update monthly cost when plan changes
  React.useEffect(() => {
    if (selectedPlan) {
      setValue('monthlyCost', selectedPlan.price);
    }
  }, [selectedPlan, setValue]);

  const onSubmit = async (data: AssignPlanFormData) => {
    if (!firestore || !tenantId) return;
    
    const newAssignmentRef = doc(collection(firestore, `tenants/${tenantId}/client_plans`));
    
    const assignmentData = {
        ...data,
        id: newAssignmentRef.id,
        createdAt: serverTimestamp(),
    };

    try {
        await addDocumentNonBlocking(newAssignmentRef, assignmentData);
        toast({
            variant: 'success',
            title: "Plan Asignado",
            description: `El plan ${selectedPlan?.name} ha sido asignado a ${selectedClient?.name}.`
        });
        router.push('/clients');
    } catch(e: any) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo asignar el plan." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => router.push('/clients')}>
        <ArrowLeft className="h-4 w-4" />
        <span>{t.clients.backToClients}</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.clients.assignPlanTitle}</h1>
        <p className="text-muted-foreground max-w-2xl">{t.clients.assignPlanDescription}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><Edit className="text-primary"/>{t.clients.planConfig}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>{t.clients.selectCommercialPlan}</Label>
                    <Controller name="servicePlanId" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={arePlansLoading}>
                            <SelectTrigger><SelectValue placeholder={t.clients.selectServicePlan} /></SelectTrigger>
                            <SelectContent>
                                {servicePlans?.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )} />
                    {errors.servicePlanId && <p className="text-xs text-destructive">{errors.servicePlanId.message}</p>}
                </div>

                <Controller name="trainingDays" control={control} render={({ field }) => (
                    <div className="space-y-3">
                        <Label>{t.clients.classDays}</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {weekdays.map(day => (
                                <Button key={day} type="button" variant={field.value.includes(day) ? 'default' : 'outline'} onClick={() => {
                                    const newDays = field.value.includes(day) ? field.value.filter(d => d !== day) : [...field.value, day];
                                    field.onChange(newDays);
                                }}>
                                    {day}
                                </Button>
                            ))}
                        </div>
                         {errors.trainingDays && <p className="text-xs text-destructive">{errors.trainingDays.message}</p>}
                    </div>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="hoursPerClass">{t.clients.hoursPerClass}</Label>
                        <Input id="hoursPerClass" type="number" step="0.5" {...register('hoursPerClass')} />
                        {errors.hoursPerClass && <p className="text-xs text-destructive">{errors.hoursPerClass.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="monthlyCost">{t.clients.monthlyCostEst}</Label>
                        <Input id="monthlyCost" type="number" step="0.01" {...register('monthlyCost')} />
                        {errors.monthlyCost && <p className="text-xs text-destructive">{errors.monthlyCost.message}</p>}
                    </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><CreditCard className="text-primary"/>{t.clients.paymentMethod}</CardTitle>
            </CardHeader>
            <CardContent>
                <Controller name="paymentMethod" control={control} render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['cash', 'card', 'transfer'].map(method => (
                            <div key={method}>
                                <RadioGroupItem value={method} id={method} className="peer sr-only"/>
                                <Label htmlFor={method} className="flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-colors">
                                    <span>{t.clients.paymentMethods[method as keyof typeof t.clients.paymentMethods]}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-5">
            <Card className="sticky top-6">
                <CardHeader>
                    <div className="flex justify-between items-center mb-4">
                        <CardTitle>{t.clients.selectStudent}</CardTitle>
                        <Badge variant="secondary">{clients?.length || 0} {t.dashboard.activeStudents}</Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={t.payments.searchByName} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    {areClientsLoading ? (
                       <div className="space-y-2">
                           <Skeleton className="h-16 w-full" />
                           <Skeleton className="h-16 w-full" />
                           <Skeleton className="h-16 w-full" />
                       </div>
                    ) : (
                        filteredClients?.map(client => (
                            <div key={client.id} className={cn("p-3 rounded-lg border-2 flex items-center gap-4 cursor-pointer transition-colors", watchClientId === client.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50')} onClick={() => setValue('clientId', client.id, { shouldValidate: true })}>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint={client.avatarHint} />
                                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">{client.currentPlan || "Sin plan"}</p>
                                </div>
                                {watchClientId === client.id && <CheckCircle className="text-primary h-5 w-5"/>}
                            </div>
                        ))
                    )}
                    {errors.clientId && <p className="text-center text-xs text-destructive py-4">{errors.clientId.message}</p>}
                </CardContent>
                <div className="p-6 border-t">
                    <div className="flex justify-between text-sm mb-4">
                        <span className="text-muted-foreground">{t.clients.totalToPay}</span>
                        <span className="text-xl font-bold">{selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : '$0.00'}</span>
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {t.clients.assignPlanTo} {selectedClient?.name.split(' ')[0] || '...'}
                    </Button>
                </div>
            </Card>
        </div>
      </form>
    </div>
  );
}
