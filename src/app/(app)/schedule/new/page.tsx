
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { add, formatISO, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2,
  Plus,
  Minus,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Client, Mesocycle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const newSessionSchema = z.object({
  clientId: z.string().min(1, "Debes seleccionar un cliente."),
  title: z.string().min(1, "El título es obligatorio."),
  workPlanId: z.string().optional(),
  startDateTime: z.string().min(1, "La fecha y hora de inicio son obligatorias."),
  duration: z.coerce.number().min(15, "La duración debe ser de al menos 15 minutos."),
  location: z.string().optional(),
  instructions: z.string().optional(),
});

type NewSessionFormData = z.infer<typeof newSessionSchema>;

export default function NewSessionPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const tenantId = user?.uid;

  const clientsQuery = useMemoFirebase(
    () => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null),
    [firestore, tenantId]
  );
  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsQuery);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewSessionFormData>({
    resolver: zodResolver(newSessionSchema),
    defaultValues: {
      duration: 60,
      startDateTime: formatISO(new Date()).slice(0, 16),
    },
  });

  const watchClientId = watch('clientId');

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [clients, searchQuery]);

  const onSubmit = async (data: NewSessionFormData) => {
    if (!firestore || !tenantId) return;

    const newEventRef = doc(collection(firestore, `tenants/${tenantId}/events`));
    const startDate = parseISO(data.startDateTime);
    const endDate = add(startDate, { minutes: data.duration });

    const eventData = {
      id: newEventRef.id,
      title: data.title,
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
      clients: [data.clientId],
      location: data.location,
      workPlan: data.workPlanId,
      instructions: data.instructions,
      type: 'individual',
      createdAt: serverTimestamp(),
    };

    try {
        await addDocumentNonBlocking(newEventRef, eventData);
        toast({ variant: 'success', title: "Sesión Creada", description: `La sesión "${data.title}" ha sido agendada.` });
        router.push('/schedule');
    } catch (e: any) {
        toast({ variant: 'destructive', title: "Error", description: "No se pudo crear la sesión." });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <a onClick={() => router.push('/schedule')} className="hover:text-primary transition-colors cursor-pointer">{t.nav.schedule}</a>
                <span>/</span>
                <span>{t.schedule.newSession}</span>
            </div>
            <h1 className="text-3xl font-bold font-headline">Programar Entrenamiento</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/schedule')}>{t.settings.cancel}</Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
            Guardar Sesión
          </Button>
        </div>
      </header>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><Calendar className="text-primary"/> Detalles de la Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Título de la Sesión</Label>
                    <Input id="title" {...control.register('title')} placeholder="Ej: Sesión de Fuerza - Tren Superior" />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Fecha y Hora de Inicio</Label>
                  <Input id="startDateTime" type="datetime-local" {...control.register('startDateTime')} />
                  {errors.startDateTime && <p className="text-xs text-destructive">{errors.startDateTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setValue('duration', Math.max(15, watch('duration') - 15))}><Minus className="h-4 w-4" /></Button>
                    <Input id="duration" type="number" className="text-center" {...control.register('duration')} />
                    <Button type="button" variant="outline" size="icon" onClick={() => setValue('duration', watch('duration') + 15)}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
                </div>
              </div>
               <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="location" {...control.register('location')} placeholder="Ej: Gimnasio Central, Parque del Retiro..." className="pl-9" />
                    </div>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><FileText className="text-primary"/> Instrucciones de la Sesión</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea {...control.register('instructions')} placeholder="Añade notas, focos de la sesión o recordatorios importantes para el cliente..." rows={5}/>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3"><User className="text-primary"/> Asignar Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar cliente..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {areClientsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  filteredClients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => setValue('clientId', client.id, { shouldValidate: true })}
                      className={`p-3 rounded-lg border-2 flex items-center gap-3 cursor-pointer transition-colors ${watchClientId === client.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.avatarUrl} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
            
              <div className="space-y-2 pt-4 border-t">
                  <Label>Plan de Entrenamiento (Opcional)</Label>
                  <Controller
                    name="workPlanId"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Asociar a un plan existente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {/* This would be populated with the client's mesocycles */}
                                <SelectItem value="plan1">Hipertrofia - Semana 3</SelectItem>
                                <SelectItem value="plan2">Pérdida de Grasa - Semana 1</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
              </div>

            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
