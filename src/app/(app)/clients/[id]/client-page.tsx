
'use client';
import React from 'react';
import Image from 'next/image';
import {
  Dumbbell, HeartPulse, Scale, Ruler, FileText, User, MessageSquare, CalendarDays,
  Briefcase, Cake, Phone, Mail, MapPin, Flag, Plus, X, CheckCircle2, ChevronRight,
  VenetianMask, Calculator, Percent, Gauge, FileWarning, AlertTriangle, Target, Move,
  ArrowDownToLine, PersonStanding, Hand, Timer, Repeat, ShieldCheck, Activity, Zap,
  Award, Heart, Droplet, TestTube, Bone, Disc3, Brain, Pill, FilePlus2,
  CalendarCheck, HeartHandshake, FlaskConical, CircleAlert, ShieldAlert, FileKey2,
  UserCheck, Loader2, Footprints, StretchVertical, Wind as WindIcon, Scale as ScaleIcon, MoveVertical, GitCompare, Siren, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/language-context';
import type { Client, Note, Biomechanics } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WeightChart } from '@/components/charts/weight-chart';
import { BodyCompositionChart } from '@/components/charts/body-composition-chart';
import { MuscleMassChart } from '@/components/charts/muscle-mass-chart';
import { GoalProgressChart } from '@/components/charts/goal-progress-chart';
import { useFirebase, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const clientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  lastName: z.string().min(1, 'El apellido es obligatorio.'),
  email: z.string().email('Email inválido.'),
  phoneNumber: z.string().optional(),
  birthDate: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  objective: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const biomechanicsSchema = z.object({
  weight: z.coerce.number().min(1, "El peso es obligatorio"),
  height: z.coerce.number().min(1, "La altura es obligatoria"),
  ankleDorsiflexion: z.coerce.number().optional(),
  hipMobility: z.coerce.number().optional(),
  shoulderMobility: z.coerce.number().optional(),
  coreStability: z.coerce.number().optional(),
  hipStability: z.coerce.number().optional(),
  squatPattern: z.coerce.number().optional(),
  hipHingePattern: z.coerce.number().optional(),
  relativeStrengthLower: z.coerce.number().optional(),
  relativeStrengthUpper: z.coerce.number().optional(),
  unilateralBalance: z.coerce.number().optional(),
  asymmetries: z.coerce.number().optional(),
  movementPain: z.coerce.number().optional(),
});

type BiomechanicsFormData = z.infer<typeof biomechanicsSchema>;

const MetricItem = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string | number | undefined, unit?: string }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{value ?? 'N/A'} {unit}</span>
    </div>
);

export default function ClientDetailClientPage({ clientId }: { clientId: string }) {
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const tenantId = user?.uid;

  // --- Data Fetching ---
  const clientDocRef = useMemoFirebase(
    () => (firestore && tenantId && clientId ? doc(firestore, `tenants/${tenantId}/user_profile`, clientId) : null),
    [firestore, tenantId, clientId]
  );
  const { data: client, isLoading: isClientLoading } = useDoc<Client>(clientDocRef);
  
  const notesCollectionRef = useMemoFirebase(
      () => (firestore && tenantId && clientId ? collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/notes`) : null),
      [firestore, tenantId, clientId]
  );
  const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesCollectionRef);

  const biomechanicsCollectionRef = useMemoFirebase(
    () => (firestore && tenantId && clientId ? query(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/biomechanics`), orderBy("createdAt", "desc"), limit(1)) : null),
    [firestore, tenantId, clientId]
  );
  const { data: biomechanicsHistory, isLoading: areBiomechanicsLoading } = useCollection<Biomechanics>(biomechanicsCollectionRef);
  const latestBiomechanics = biomechanicsHistory?.[0];

  // --- Forms ---
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const biomechanicsForm = useForm<BiomechanicsFormData>({
    resolver: zodResolver(biomechanicsSchema),
    defaultValues: {
      weight: 0,
      height: 0,
    }
  });

  const { watch: watchBiomechanics, setValue: setBiomechanicsValue } = biomechanicsForm;
  const weight = watchBiomechanics('weight');
  const height = watchBiomechanics('height');
  const calculatedBmi = React.useMemo(() => {
    if (weight > 0 && height > 0) {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return '0.00';
  }, [weight, height]);
  

  React.useEffect(() => {
    if (client) {
      clientForm.reset({
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ').slice(1).join(' '),
        email: client.email,
        phoneNumber: client.phoneNumber || '',
        birthDate: client.birthDate || '',
        occupation: client.occupation || '',
        address: client.address || '',
        objective: client.objective || 'Hypertrophy',
        tags: client.tags || [],
      });
    }
  }, [client, clientForm.reset]);

  React.useEffect(() => {
    if (latestBiomechanics) {
      biomechanicsForm.reset({
        ...latestBiomechanics,
        height: latestBiomechanics.height ? latestBiomechanics.height * 100 : 0 // Convert meters to cm for display
      });
    }
  }, [latestBiomechanics, biomechanicsForm.reset]);
  
  const onClientSubmit = async (data: ClientFormData) => {
    if (!clientDocRef) return;
    
    await updateDocumentNonBlocking(clientDocRef, data);
    toast({
        variant: 'success',
        title: 'Perfil Actualizado',
        description: 'Los datos del cliente han sido guardados correctamente.',
    });
  };

  const onBiomechanicsSubmit = async (data: BiomechanicsFormData) => {
    if (!firestore || !tenantId || !clientId) return;
    
    const newBiomechanicsRef = doc(collection(firestore, `tenants/${tenantId}/user_profile/${clientId}/biomechanics`));
    
    const dataToSave = {
        ...data,
        id: newBiomechanicsRef.id,
        createdAt: serverTimestamp(),
        bmi: parseFloat(calculatedBmi),
        height: data.height ? data.height / 100 : 0 // Convert cm to meters for storage
    };

    await addDocumentNonBlocking(newBiomechanicsRef, dataToSave);
    toast({
        variant: 'success',
        title: 'Evaluación Guardada',
        description: 'La nueva evaluación biomecánica ha sido guardada en el historial.',
    });
  }

  const isOwnProfile = user?.uid === clientId;
  
  if (isClientLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-8 w-1/2" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="lg:col-span-2">
                       <Skeleton className="h-[600px] w-full" />
                  </div>
              </div>
          </div>
      );
  }

  if (!client) {
    return <div>{t.clientDetail.notFound || "Client not found."}</div>;
  }
  
  const clientName = client.name;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Inicio</span>
            <ChevronRight className="h-4 w-4" />
            <span>{t.nav.clients}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{clientName}</span>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden text-center">
            <CardContent className="p-6">
              <Image
                src={client.avatarUrl || `https://i.pravatar.cc/128?u=${client.id}`}
                alt={`Avatar of ${clientName}`}
                data-ai-hint={client.avatarHint || 'person face'}
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary shadow-lg"
              />
              <h1 className="text-3xl font-bold font-headline">{clientName}</h1>
              <p className="text-muted-foreground">{t.clientDetail.objective}: {client.objective}</p>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t.clientDetail.message}
                </Button>
                <Button variant="outline" size="icon">
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-6 w-6 p-1 rounded-full bg-blue-100 text-blue-500" />
                    <span>{t.clientDetail.age}</span>
                 </div>
                 <p className="font-bold text-lg">{client.profile?.age || 'N/A'} años</p>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Scale className="h-6 w-6 p-1 rounded-full bg-orange-100 text-orange-500" />
                    <span>{t.clientDetail.weight}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{latestBiomechanics?.weight || 'N/A'} kg</p>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Ruler className="h-6 w-6 p-1 rounded-full bg-purple-100 text-purple-500" />
                    <span>{t.clientDetail.height}</span>
                 </div>
                 <p className="font-bold text-lg">{latestBiomechanics?.height ? latestBiomechanics.height * 100 : 'N/A'} cm</p>
               </div>
            </CardContent>
          </Card>
          
           <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t.clientDetail.profileCompleted}</span>
                        <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{t.clientDetail.missingMedicalHistory}</p>
                </CardContent>
           </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <Tabs defaultValue="personal-info">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="personal-info">{t.clientDetail.personalInfo}</TabsTrigger>
                    <TabsTrigger value="medical">{t.clientDetail.medicalTitle}</TabsTrigger>
                    <TabsTrigger value="biomechanics">{t.clientDetail.biomechanics.title}</TabsTrigger>
                    <TabsTrigger value="progress">{t.clientDetail.progress}</TabsTrigger>
                </TabsList>
                <TabsContent value="personal-info">
                    <Card>
                        <form onSubmit={clientForm.handleSubmit(onClientSubmit)}>
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="text-primary"/> {t.clientDetail.basicData}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t.clientDetail.name}</Label>
                                        <Input id="firstName" {...clientForm.register('firstName')} />
                                        {clientForm.formState.errors.firstName && <p className="text-xs text-destructive">{clientForm.formState.errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t.clientDetail.lastName}</Label>
                                        <Input id="lastName" {...clientForm.register('lastName')} />
                                        {clientForm.formState.errors.lastName && <p className="text-xs text-destructive">{clientForm.formState.errors.lastName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">{t.clientDetail.occupation}</Label>
                                        <Input id="occupation" {...clientForm.register('occupation')} placeholder="Ej: Estudiante, Programador..."/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">{t.clientDetail.birthDate}</Label>
                                        <Input id="birthDate" type="date" {...clientForm.register('birthDate')} />
                                    </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Phone className="text-primary"/> {t.clientDetail.contact}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address">{t.clientDetail.address}</Label>
                                            <Input id="address" {...clientForm.register('address')} placeholder="Ej: Av. Siempreviva 742" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t.clientDetail.email}</Label>
                                            <Input id="email" type="email" {...clientForm.register('email')} />
                                            {clientForm.formState.errors.email && <p className="text-xs text-destructive">{clientForm.formState.errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">{t.clientDetail.phone}</Label>
                                            <Input id="phoneNumber" type="tel" {...clientForm.register('phoneNumber')} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Flag className="text-primary"/> {t.clientDetail.goalsAndNotes}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="objective">{t.clientDetail.objective}</Label>
                                            <Textarea id="objective" {...clientForm.register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..."/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.clientDetail.tags}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {client.trainingDays?.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30">{tag} 
                                                    <X className="ml-1 h-3 w-3 cursor-pointer"/>
                                                    </Badge>
                                                ))}
                                                <Button variant="outline" size="sm" className="text-muted-foreground"><Plus className="mr-1 h-3 w-3"/>{t.clientDetail.addTag}</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" type="button" onClick={() => clientForm.reset()}>{t.clientDetail.cancel}</Button>
                                    <Button type="submit" disabled={clientForm.formState.isSubmitting}>
                                        {clientForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.clientDetail.saveChanges}
                                    </Button>
                                </div>
                                
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="medical">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FilePlus2 className="text-primary"/>{t.clientDetail.medicalTitle}</CardTitle>
                             <CardDescription>{t.clientDetail.medicalDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           <p className="text-muted-foreground md:col-span-2">No se han añadido datos médicos todavía.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="biomechanics">
                    <Card>
                        <form onSubmit={biomechanicsForm.handleSubmit(onBiomechanicsSubmit)}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2"><Footprints className="text-primary"/>{t.clientDetail.biomechanics.title}</CardTitle>
                                        <CardDescription>{t.clientDetail.biomechanics.descriptionForm}</CardDescription>
                                    </div>
                                    <p className="text-sm text-muted-foreground pt-1">
                                        {latestBiomechanics ? `Última act: ${format(new Date(latestBiomechanics.createdAt), 'dd MMM yyyy')}` : 'Sin datos previos'}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">{t.clientDetail.biomechanics.weight}</Label>
                                        <Input id="weight" type="number" step="0.1" {...biomechanicsForm.register('weight')} placeholder="kg"/>
                                        {biomechanicsForm.formState.errors.weight && <p className="text-xs text-destructive">{biomechanicsForm.formState.errors.weight.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="height">{t.clientDetail.biomechanics.height}</Label>
                                        <Input id="height" type="number" step="1" {...biomechanicsForm.register('height')} placeholder="cm"/>
                                        {biomechanicsForm.formState.errors.height && <p className="text-xs text-destructive">{biomechanicsForm.formState.errors.height.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bmi">{t.clientDetail.biomechanics.bmi}</Label>
                                        <Input id="bmi" value={calculatedBmi} disabled className="font-bold"/>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="ankleDorsiflexion">{t.clientDetail.biomechanics.ankleDorsiflexion}</Label>
                                        <Input id="ankleDorsiflexion" type="number" {...biomechanicsForm.register('ankleDorsiflexion')} placeholder="°"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="hipMobility">{t.clientDetail.biomechanics.hipMobility}</Label>
                                        <Input id="hipMobility" type="number" {...biomechanicsForm.register('hipMobility')} placeholder="°"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="shoulderMobility">{t.clientDetail.biomechanics.shoulderMobility}</Label>
                                        <Input id="shoulderMobility" type="number" {...biomechanicsForm.register('shoulderMobility')} placeholder="°"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="coreStability">{t.clientDetail.biomechanics.coreStability}</Label>
                                        <Input id="coreStability" type="number" {...biomechanicsForm.register('coreStability')} placeholder="s"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="hipStability">{t.clientDetail.biomechanics.hipStability}</Label>
                                        <Input id="hipStability" type="number" {...biomechanicsForm.register('hipStability')} placeholder="score 0-5"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="squatPattern">{t.clientDetail.biomechanics.squatPattern}</Label>
                                        <Input id="squatPattern" type="number" {...biomechanicsForm.register('squatPattern')} placeholder="score 0-5"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="hipHingePattern">{t.clientDetail.biomechanics.hipHingePattern}</Label>
                                        <Input id="hipHingePattern" type="number" {...biomechanicsForm.register('hipHingePattern')} placeholder="score 0-5"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="relativeStrengthLower">{t.clientDetail.biomechanics.relativeStrengthLower}</Label>
                                        <Input id="relativeStrengthLower" type="number" step="0.01" {...biomechanicsForm.register('relativeStrengthLower')} placeholder="kg/kg"/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="relativeStrengthUpper">{t.clientDetail.biomechanics.relativeStrengthUpper}</Label>
                                        <Input id="relativeStrengthUpper" type="number" step="0.01" {...biomechanicsForm.register('relativeStrengthUpper')} placeholder="kg/kg"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unilateralBalance">{t.clientDetail.biomechanics.unilateralBalance}</Label>
                                        <Input id="unilateralBalance" type="number" {...biomechanicsForm.register('unilateralBalance')} placeholder="s"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="asymmetries">{t.clientDetail.biomechanics.asymmetries}</Label>
                                        <Input id="asymmetries" type="number" {...biomechanicsForm.register('asymmetries')} placeholder="%"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="movementPain">{t.clientDetail.biomechanics.movementPain}</Label>
                                        <Input id="movementPain" type="number" {...biomechanicsForm.register('movementPain')} placeholder="escala 0-10"/>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" type="button" onClick={() => biomechanicsForm.reset()}>{t.clientDetail.cancel}</Button>
                                    <Button type="submit" disabled={biomechanicsForm.formState.isSubmitting}>
                                        {biomechanicsForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.clientDetail.biomechanics.saveEvaluation}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>
                 <TabsContent value="progress">
                     <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WeightChart />
                            <BodyCompositionChart />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <MuscleMassChart />
                            <GoalProgressChart />
                        </div>

                        <Separator />
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">{t.clientDetail.trackingNotes}</h3>
                                <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> {t.clientDetail.addNote}</Button>
                            </div>
                            <div className="space-y-6">
                                {areNotesLoading && <Loader2 className="animate-spin" />}
                                {!areNotesLoading && notes?.map((note) => (
                                <div key={note.id} className="flex items-start gap-4">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={note.coachAvatarUrl} alt={note.coachName} />
                                        <AvatarFallback>{note.coachName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{note.coachName}</p>
                                        <p className="text-xs text-muted-foreground">
                                        {format(new Date(note.createdAt), "PPP", { locale: language === 'es' ? es : undefined })}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                                    </div>
                                </div>
                                ))}
                                {!areNotesLoading && notes?.length === 0 && (
                                    <p className="text-muted-foreground text-sm text-center py-4">No hay notas para este cliente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
