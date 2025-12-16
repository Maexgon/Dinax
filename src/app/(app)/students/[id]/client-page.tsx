'use client';
import Image from 'next/image';
import {
  Dumbbell, HeartPulse, Scale, Ruler, FileText, User, MessageSquare, CalendarDays,
  Briefcase, Cake, Phone, Mail, MapPin, Flag, Plus, X, CheckCircle2, ChevronRight,
  VenetianMask, Calculator, Percent, Gauge, FileWarning, AlertTriangle, Target, Move,
  ArrowDownToLine, PersonStanding, Hand, Timer, Repeat, ShieldCheck, Activity, Zap,
  Award, Heart, Droplet, TestTube, Wind, Bone, Disc3, Brain, Pill, FilePlus2,
  CalendarCheck, HeartHandshake, FlaskConical, CircleAlert, ShieldAlert, FileKey2,
  UserCheck, Loader2
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
import type { Student, Note } from '@/lib/types';
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


const studentSchema = z.object({
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

type StudentFormData = z.infer<typeof studentSchema>;

const MetricItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{value}</span>
    </div>
);


export default function StudentDetailClientPage({ studentId }: { studentId: string }) {
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  // The tenantId is the UID of the logged-in user (coach)
  const tenantId = user?.uid;

  const studentDocRef = useMemoFirebase(
    () => (firestore && tenantId ? doc(firestore, `tenants/${tenantId}/users`, studentId) : null),
    [firestore, tenantId, studentId]
  );
  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  const notesCollectionRef = useMemoFirebase(
    () => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/users/${studentId}/notes`) : null),
    [firestore, tenantId, studentId]
  );
  const { data: notes, isLoading: areNotesLoading } = useCollection<Note>(notesCollectionRef);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
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
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber || '',
        birthDate: student.birthDate || '',
        occupation: student.occupation || '',
        address: student.address || '',
        objective: student.objective || '',
        tags: student.tags || [],
      });
    }
  }, [student, reset]);
  
  const onSubmit = async (data: StudentFormData) => {
    if (!studentDocRef) return;
    
    updateDocumentNonBlocking(studentDocRef, data);
    
    toast({
        variant: 'success',
        title: 'Perfil Actualizado',
        description: 'Tus datos han sido guardados correctamente.',
    });
  };

  const isOwnProfile = user?.uid === studentId;
  
  if (isStudentLoading) {
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

  if (!student) {
    return <div>{t.studentDetail.notFound || "Student not found."}</div>;
  }
  
  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim();


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Inicio</span>
            <ChevronRight className="h-4 w-4" />
            <span>{t.nav.students}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{studentName}</span>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden text-center">
            <CardContent className="p-6">
              <Image
                src={student.avatarUrl || 'https://picsum.photos/seed/placeholder/128/128'}
                alt={`Avatar of ${studentName}`}
                data-ai-hint={student.avatarHint || 'person face'}
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary shadow-lg"
              />
              <h1 className="text-3xl font-bold font-headline">{studentName}</h1>
              <p className="text-muted-foreground">{t.studentDetail.objective}: {student.objective || 'N/A'}</p>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t.studentDetail.message}
                </Button>
                <Button variant="outline" size="icon">
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
                {/* Simplified metrics. Biomechanics data will be in its tab */}
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-6 w-6 p-1 rounded-full bg-blue-100 text-blue-500" />
                    <span>{t.studentDetail.age}</span>
                 </div>
                 <p className="font-bold text-lg">{student.birthDate ? `${format(new Date(), 'yyyy') - format(new Date(student.birthDate), 'yyyy')} años` : 'N/A'}</p>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Scale className="h-6 w-6 p-1 rounded-full bg-orange-100 text-orange-500" />
                    <span>{t.studentDetail.weight}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{/* TODO: Fetch from biomechanics */} -- kg</p>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Ruler className="h-6 w-6 p-1 rounded-full bg-purple-100 text-purple-500" />
                    <span>{t.studentDetail.height}</span>
                 </div>
                 <p className="font-bold text-lg">{/* TODO: Fetch from biomechanics */} -- cm</p>
               </div>
            </CardContent>
          </Card>
          
           <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{t.studentDetail.profileCompleted}</span>
                        <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{t.studentDetail.missingMedicalHistory}</p>
                </CardContent>
           </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <Tabs defaultValue="personal-info">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger value="personal-info">{t.studentDetail.personalInfo}</TabsTrigger>
                    <TabsTrigger value="medical">{t.studentDetail.medicalTitle}</TabsTrigger>
                    <TabsTrigger value="biomechanics">{t.studentDetail.biomechanics}</TabsTrigger>
                    <TabsTrigger value="progress">{t.studentDetail.progress}</TabsTrigger>
                </TabsList>
                <TabsContent value="personal-info">
                    <Card>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="text-primary"/> {t.studentDetail.basicData}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t.studentDetail.name}</Label>
                                        <Input id="firstName" {...register('firstName')} disabled={!isOwnProfile} />
                                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t.studentDetail.lastName}</Label>
                                        <Input id="lastName" {...register('lastName')} disabled={!isOwnProfile} />
                                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="occupation">{t.studentDetail.occupation}</Label>
                                        <Input id="occupation" {...register('occupation')} disabled={!isOwnProfile} placeholder="Ej: Estudiante, Programador..."/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">{t.studentDetail.birthDate}</Label>
                                        <Input id="birthDate" type="date" {...register('birthDate')} disabled={!isOwnProfile}/>
                                    </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Phone className="text-primary"/> {t.studentDetail.contact}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="address">{t.studentDetail.address}</Label>
                                            <Input id="address" {...register('address')} disabled={!isOwnProfile} placeholder="Ej: Av. Siempreviva 742" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t.studentDetail.email}</Label>
                                            <Input id="email" type="email" {...register('email')} disabled={!isOwnProfile} />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">{t.studentDetail.phone}</Label>
                                            <Input id="phoneNumber" type="tel" {...register('phoneNumber')} disabled={!isOwnProfile} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Flag className="text-primary"/> {t.studentDetail.goalsAndNotes}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="objective">{t.studentDetail.objective}</Label>
                                            <Textarea id="objective" {...register('objective')} placeholder="Ej: Ganar masa muscular, perder peso..." disabled={!isOwnProfile}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t.studentDetail.tags}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {(student.tags || []).map(tag => (
                                                    <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30">{tag} 
                                                    {isOwnProfile && <X className="ml-1 h-3 w-3 cursor-pointer"/>}
                                                    </Badge>
                                                ))}
                                                {isOwnProfile && <Button variant="outline" size="sm" className="text-muted-foreground"><Plus className="mr-1 h-3 w-3"/>{t.studentDetail.addTag}</Button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isOwnProfile && (
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" type="button" onClick={() => reset()}>{t.studentDetail.cancel}</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.studentDetail.saveChanges}
                                    </Button>
                                </div>
                                )}
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="medical">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FilePlus2 className="text-primary"/>{t.studentDetail.medicalTitle}</CardTitle>
                             <CardDescription>{t.studentDetail.medicalDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           <p className="text-muted-foreground md:col-span-2">No se han añadido datos médicos todavía.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="biomechanics">
                    <Card>
                        <CardHeader><CardTitle>{t.studentDetail.biomechanics}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                           <p className="text-muted-foreground">No se han añadido datos biomecánicos todavía.</p>
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
                                <h3 className="text-lg font-semibold">{t.studentDetail.trackingNotes}</h3>
                                <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> {t.studentDetail.addNote}</Button>
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
