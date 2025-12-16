
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
  UserCheck, Loader2, Footprints, Stretch, Wind as WindIcon, Scale as ScaleIcon, MoveVertical, GitCompare, Siren, Info
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
import { useFirebase, useMemoFirebase, useDoc, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
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
  
  // MOCK DATA FOR BIOMECHANICS, will be replaced by Firestore data
  const biomechanicsData: Biomechanics = {
    id: 'bio1',
    weight: 72.5,
    height: 1.78,
    bmi: 22.9,
    ankleDorsiflexion: 20,
    hipMobility: 120,
    shoulderMobility: 160,
    coreStability: 90,
    hipStability: 4,
    squatPattern: 3,
    hipHingePattern: 4,
    relativeStrengthLower: 1.8,
    relativeStrengthUpper: 1.2,
    unilateralBalance: 45,
    asymmetries: 5,
    movementPain: 1,
  };


  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      birthDate: '',
      occupation: '',
      address: '',
      objective: '',
      tags: [],
    },
  });

  React.useEffect(() => {
    if (client) {
      reset({
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
  }, [client, reset]);
  
  const onSubmit = async (data: ClientFormData) => {
    if (!clientDocRef) return;
    
    await updateDocumentNonBlocking(clientDocRef, data);
    toast({
        variant: 'success',
        title: 'Perfil Actualizado',
        description: 'Los datos del cliente han sido guardados correctamente.',
    });
  };

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
                    <p className="font-bold text-lg">{client.profile?.weight || 'N/A'} kg</p>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Ruler className="h-6 w-6 p-1 rounded-full bg-purple-100 text-purple-500" />
                    <span>{t.clientDetail.height}</span>
                 </div>
                 <p className="font-bold text-lg">{client.profile?.height || 'N/A'} cm</p>
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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="text-primary"/> {t.clientDetail.basicData}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t.clientDetail.name}</Label>
                                        <Input id="firstName" {...register('firstName')} />
                                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t.clientDetail.lastName}</Label>
                                        <Input id="lastName" {...register('lastName')} />
                                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">{t.clientDetail.occupation}</Label>
                                        <Input id="occupation" {...register('occupation')} placeholder="Ej: Estudiante, Programador..."/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">{t.clientDetail.birthDate}</Label>
                                        <Input id="birthDate" type="date" {...register('birthDate')} />
                                    </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Phone className="text-primary"/> {t.clientDetail.contact}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address">{t.clientDetail.address}</Label>
                                            <Input id="address" {...register('address')} placeholder="Ej: Av. Siempreviva 742" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t.clientDetail.email}</Label>
                                            <Input id="email" type="email" {...register('email')} />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">{t.clientDetail.phone}</Label>
                                            <Input id="phoneNumber" type="tel" {...register('phoneNumber')} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Flag className="text-primary"/> {t.clientDetail.goalsAndNotes}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="objective">{t.clientDetail.objective}</Label>
                                            <Textarea id="objective" {...register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..."/>
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
                                    <Button variant="ghost" type="button" onClick={() => reset()}>{t.clientDetail.cancel}</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Footprints className="text-primary"/>{t.clientDetail.biomechanics.title}</CardTitle>
                            <CardDescription>{t.clientDetail.biomechanics.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <MetricItem icon={<ScaleIcon className="text-blue-500" />} label={t.clientDetail.biomechanics.weight} value={biomechanicsData.weight} unit="kg" />
                            <MetricItem icon={<Ruler className="text-blue-500" />} label={t.clientDetail.biomechanics.height} value={biomechanicsData.height} unit="m" />
                            <MetricItem icon={<Calculator className="text-blue-500" />} label={t.clientDetail.biomechanics.bmi} value={biomechanicsData.bmi} unit="kg/m²" />
                            <MetricItem icon={<Stretch className="text-green-500" />} label={t.clientDetail.biomechanics.ankleDorsiflexion} value={biomechanicsData.ankleDorsiflexion} unit="°" />
                            <MetricItem icon={<Stretch className="text-green-500" />} label={t.clientDetail.biomechanics.hipMobility} value={biomechanicsData.hipMobility} unit="°" />
                            <MetricItem icon={<Stretch className="text-green-500" />} label={t.clientDetail.biomechanics.shoulderMobility} value={biomechanicsData.shoulderMobility} unit="°" />
                            <MetricItem icon={<Activity className="text-orange-500" />} label={t.clientDetail.biomechanics.coreStability} value={biomechanicsData.coreStability} unit="s" />
                            <MetricItem icon={<WindIcon className="text-orange-500" />} label={t.clientDetail.biomechanics.hipStability} value={biomechanicsData.hipStability} unit="/ 5" />
                            <MetricItem icon={<MoveVertical className="text-purple-500" />} label={t.clientDetail.biomechanics.squatPattern} value={biomechanicsData.squatPattern} unit="/ 5" />
                            <MetricItem icon={<Move className="text-purple-500" />} label={t.clientDetail.biomechanics.hipHingePattern} value={biomechanicsData.hipHingePattern} unit="/ 5" />
                            <MetricItem icon={<Dumbbell className="text-red-500" />} label={t.clientDetail.biomechanics.relativeStrengthLower} value={biomechanicsData.relativeStrengthLower} unit="kg/kg" />
                            <MetricItem icon={<Dumbbell className="text-red-500" />} label={t.clientDetail.biomechanics.relativeStrengthUpper} value={biomechanicsData.relativeStrengthUpper} unit="kg/kg" />
                            <MetricItem icon={<PersonStanding className="text-yellow-500" />} label={t.clientDetail.biomechanics.unilateralBalance} value={biomechanicsData.unilateralBalance} unit="s" />
                            <MetricItem icon={<GitCompare className="text-yellow-500" />} label={t.clientDetail.biomechanics.asymmetries} value={biomechanicsData.asymmetries} unit="%" />
                            <MetricItem icon={<Siren className="text-destructive" />} label={t.clientDetail.biomechanics.movementPain} value={biomechanicsData.movementPain} unit="/ 10" />
                            <div className="md:col-span-2 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg flex items-start gap-3">
                                <Info className="h-5 w-5 text-blue-500 mt-0.5"/>
                                <div>
                                    <p className="font-semibold text-blue-800 dark:text-blue-300">{t.clientDetail.biomechanics.observationTitle}</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">{t.clientDetail.biomechanics.observationText}</p>
                                </div>
                            </div>
                        </CardContent>
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
