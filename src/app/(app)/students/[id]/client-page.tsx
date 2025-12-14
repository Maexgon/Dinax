'use client';
import Image from 'next/image';
import {
  Dumbbell,
  HeartPulse,
  Scale,
  Ruler,
  FileText,
  User,
  MessageSquare,
  CalendarDays,
  Briefcase,
  Cake,
  Phone,
  Mail,
  MapPin,
  Flag,
  Plus,
  X,
  CheckCircle2,
  ChevronRight,
  VenetianMask,
  Calculator,
  Percent,
  Gauge,
  FileWarning,
  AlertTriangle,
  Target,
  Move,
  ArrowDownToLine,
  PersonStanding,
  Hand,
  Timer,
  Repeat,
  ShieldCheck,
  TrendingUp,
  Activity,
  Zap,
  Award,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { useLanguage } from '@/context/language-context';
import type { Student } from '@/lib/types';
import { mockNotes } from '@/lib/data';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MetricItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{value}</span>
    </div>
);


export default function StudentDetailClientPage({ student }: { student: Student }) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Inicio</span>
            <ChevronRight className="h-4 w-4" />
            <span>{t.nav.students}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{student.name}</span>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden text-center">
            <CardContent className="p-6">
              <Image
                src={student.avatarUrl}
                alt={`Avatar of ${student.name}`}
                data-ai-hint={student.avatarHint}
                width={128}
                height={128}
                className="rounded-full mx-auto mb-4 border-4 border-primary shadow-lg"
              />
              <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
              <p className="text-muted-foreground">{t.studentDetail.objective}: Hipertrofia • Principiante</p>
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
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <User className="h-6 w-6 p-1 rounded-full bg-blue-100 text-blue-500" />
                    <span>{t.studentDetail.age}</span>
                 </div>
                 <p className="font-bold text-lg">{student.profile.age} años</p>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Scale className="h-6 w-6 p-1 rounded-full bg-orange-100 text-orange-500" />
                    <span>{t.studentDetail.weight}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{student.profile.weight} kg</p>
                    <Badge variant="outline" className="text-destructive border-destructive/50">-1.2%</Badge>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <Ruler className="h-6 w-6 p-1 rounded-full bg-purple-100 text-purple-500" />
                    <span>{t.studentDetail.height}</span>
                 </div>
                 <p className="font-bold text-lg">{student.profile.height} cm</p>
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
            <Tabs defaultValue="biomechanics">
                <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger key="personal-info" value="personal-info">{t.studentDetail.personalInfo}</TabsTrigger>
                    <TabsTrigger key="medical" value="medical">{t.studentDetail.medical}</TabsTrigger>
                    <TabsTrigger key="biomechanics" value="biomechanics">{t.studentDetail.biomechanics}</TabsTrigger>
                    <TabsTrigger key="progress" value="progress">{t.studentDetail.progress}</TabsTrigger>
                </TabsList>
                <TabsContent value="personal-info">
                    <Card>
                        <CardContent className="p-6 space-y-8">
                             <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><User className="text-primary"/> {t.studentDetail.basicData}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.name}</label>
                                       <div className="p-3 bg-muted rounded-md">{student.name.split(' ')[0]}</div>
                                   </div>
                                    <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.lastName}</label>
                                       <div className="p-3 bg-muted rounded-md">{student.name.split(' ')[1]}</div>
                                   </div>
                                   <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.occupation}</label>
                                       <div className="p-3 bg-muted rounded-md flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground"/> Diseñador Gráfico</div>
                                   </div>
                                   <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.birthDate}</label>
                                       <div className="p-3 bg-muted rounded-md flex items-center justify-between"><span>05/20/1995</span> <Cake className="h-4 w-4 text-muted-foreground"/></div>
                                   </div>
                                </div>
                            </div>

                             <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Phone className="text-primary"/> {t.studentDetail.contact}</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.address}</label>
                                       <div className="p-3 bg-muted rounded-md flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> Calle Principal 123, Madrid</div>
                                   </div>
                                   <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.email}</label>
                                       <div className="p-3 bg-muted rounded-md flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {student.email}</div>
                                   </div>
                                   <div className="space-y-1">
                                       <label className="text-xs text-muted-foreground">{t.studentDetail.phone}</label>
                                       <div className="p-3 bg-muted rounded-md">+34 600 123 456</div>
                                   </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Flag className="text-primary"/> {t.studentDetail.goalsAndNotes}</h3>
                                 <div className="space-y-4">
                                     <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">{t.studentDetail.tags}</label>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30">Hipertrofia <X className="ml-1 h-3 w-3"/></Badge>
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30">Principiante <X className="ml-1 h-3 w-3"/></Badge>
                                            <Button variant="outline" size="sm" className="text-muted-foreground"><Plus className="mr-1 h-3 w-3"/>{t.studentDetail.addTag}</Button>
                                        </div>
                                     </div>
                                     <div className="space-y-1 relative">
                                        <label className="text-xs text-muted-foreground">{t.studentDetail.privateNotes}</label>
                                        <Textarea className="bg-muted" rows={4} defaultValue="El cliente prefiere entrenar por las tardes. Tiene ligera molestia en hombro derecho (ver ficha médica)."/>
                                         <Card className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-2">
                                            <div className="flex items-center gap-2 text-primary/90">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <div>
                                                    <p className="font-semibold text-xs">{t.studentDetail.allSet}</p>
                                                    <p className="text-xs">{t.studentDetail.dataUpdated}</p>
                                                </div>
                                            </div>
                                         </Card>
                                     </div>
                                 </div>
                            </div>

                             <div className="flex justify-end gap-2">
                                <Button variant="ghost">{t.studentDetail.cancel}</Button>
                                <Button className="bg-primary hover:bg-primary/90">{t.studentDetail.saveChanges}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="medical">
                    <Card>
                        <CardHeader><CardTitle>{t.studentDetail.medical}</CardTitle></CardHeader>
                        <CardContent><p>{student.profile.medicalConditions}</p></CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="biomechanics">
                    <Card>
                        <CardHeader><CardTitle>{t.studentDetail.biomechanics}</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <MetricItem icon={<Cake className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.age} value={`${student.profile.age} años`} />
                                <MetricItem icon={<VenetianMask className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.gender} value={student.profile.gender} />
                                <MetricItem icon={<Ruler className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.height} value={`${student.profile.height} cm`} />
                                <MetricItem icon={<Scale className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.weight} value={`${student.profile.weight} kg`} />
                                <MetricItem icon={<Calculator className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.bmi} value="26.2" />
                                <MetricItem icon={<Percent className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.bodyFat} value="18.5%" />
                                <MetricItem icon={<Dumbbell className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.muscleMass} value="42 kg" />
                                <MetricItem icon={<HeartPulse className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.restingHr} value="62 bpm" />
                                <MetricItem icon={<Gauge className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.bloodPressure} value="120/80" />
                                <MetricItem icon={<FileWarning className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.previousInjuries} value="Rodilla derecha" />
                                <MetricItem icon={<AlertTriangle className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.currentPain} value={<Badge variant="outline" className="text-orange-500 border-orange-500/50">{t.studentDetail.pain.mild}</Badge>} />
                                <MetricItem icon={<Target className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.painZone} value={t.studentDetail.painZoneValue.shoulder} />
                                <MetricItem icon={<Move className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.shoulderMobility} value={t.studentDetail.mobility.good} />
                                <MetricItem icon={<Move className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.hipMobility} value={t.studentDetail.mobility.limited} />
                                <MetricItem icon={<Move className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.ankleMobility} value={t.studentDetail.mobility.medium} />
                                <MetricItem icon={<Move className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.spineMobility} value={t.studentDetail.mobility.good} />
                                <MetricItem icon={<ArrowDownToLine className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.trunkFlexion} value={t.studentDetail.trunkFlexionValue.reachesFeet} />
                                <MetricItem icon={<PersonStanding className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.shoulderPosture} value={t.studentDetail.posture.protracted} />
                                <MetricItem icon={<PersonStanding className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.pelvicPosition} value={t.studentDetail.pelvicPositionValue.neutral} />
                                <MetricItem icon={<PersonStanding className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.kneeValgus} value={t.studentDetail.kneeValgusValue.mild} />
                                <MetricItem icon={<Hand className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.dominance} value={t.studentDetail.dominanceValue.right} />
                                <MetricItem icon={<Timer className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.unipodalBalance} value=">30s" />
                                <MetricItem icon={<Repeat className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.pushUps} value="25" />
                                <MetricItem icon={<Repeat className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.bodyweightSquats} value="50" />
                                <MetricItem icon={<Timer className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.abdominalPlank} value="90s" />
                                <MetricItem icon={<ShieldCheck className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.generalStrengthLevel} value={t.studentDetail.level.medium} />
                                <MetricItem icon={<Activity className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.cardioCapacity} value={t.studentDetail.level.medium} />
                                <MetricItem icon={<Zap className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.postEffortRecovery} value={t.studentDetail.recovery.fast} />
                                <MetricItem icon={<Award className="w-5 h-5 text-muted-foreground"/>} label={t.studentDetail.experienceLevel} value={t.studentDetail.experience.intermediate} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="progress">
                     <Card>
                        <CardHeader>
                          <CardTitle>{t.studentDetail.progress}</CardTitle>
                          <CardDescription>Progress charts and data will be shown here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <p>Progress charts will be shown here.</p>
                            <Separator />
                             <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-semibold">{t.studentDetail.trackingNotes}</h3>
                                  <Button variant="outline"><Plus className="mr-2 h-4 w-4"/> {t.studentDetail.addNote}</Button>
                                </div>
                                <div className="space-y-6">
                                  {mockNotes.map((note) => (
                                    <div key={note.id} className="flex items-start gap-4">
                                      <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={note.coachAvatarUrl} alt={note.coachName} data-ai-hint={note.coachAvatarHint}/>
                                        <AvatarFallback>{note.coachName.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <p className="font-semibold">{note.coachName}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {format(new Date(note.date), "PPP p", { locale: language === 'es' ? es : undefined })}
                                          </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{note.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
