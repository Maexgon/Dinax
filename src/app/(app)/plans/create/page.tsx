'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, MoreVertical, GripVertical, Forward, Save, PlusCircle, Trash2, Moon, ChevronLeft, ChevronRight, Bed, Loader2, Copy, BookCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import type { Client, ExerciseWithId, PlannedExercise, Mesocycle, AppSettings } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

type WeeklyPlan = {
    [day: string]: {
        focus: string;
        isRestDay: boolean;
        exercises: PlannedExercise[];
    };
};

type PlanState = {
    [week: number]: WeeklyPlan;
};

const PlannedExerciseCard = ({ exercise, onRemove, onUpdate, isRestDay }: { exercise: PlannedExercise, onRemove: () => void, onUpdate: (planId: string, field: keyof PlannedExercise, value: string) => void, isRestDay: boolean }) => {
    const { t } = useLanguage();
    
    if(isRestDay) return null;

    return (
        <Card className="shadow-md bg-background relative group">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                     <Image src={exercise.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt={exercise.name} width={60} height={60} className="rounded-md object-cover" />
                    <div className="flex-1">
                        <Input className="font-semibold border-none p-0 h-auto focus-visible:ring-0 text-base" value={exercise.name} onChange={e => onUpdate(exercise.planId, 'name', e.target.value)} />
                        <div className='flex gap-1 mt-1'>
                            {exercise.muscleGroups?.slice(0, 2).map(m => <Badge key={m} variant="secondary" className='text-xs'>{m}</Badge>)}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center mt-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.duration}</p>
                        <Input className="p-1 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="m" value={exercise.duration} onChange={e => onUpdate(exercise.planId, 'duration', e.target.value)} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.sets}</p>
                        <Input className="p-1 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-" value={exercise.sets} onChange={e => onUpdate(exercise.planId, 'sets', e.target.value)} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.reps}</p>
                        <Input className="p-1 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-" value={exercise.reps} onChange={e => onUpdate(exercise.planId, 'reps', e.target.value)} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rpe}</p>
                        <Input className="p-1 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-" value={exercise.rpe} onChange={e => onUpdate(exercise.planId, 'rpe', e.target.value)}/>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rest}</p>
                        <Input className="p-1 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="s" value={exercise.rest} onChange={e => onUpdate(exercise.planId, 'rest', e.target.value)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const DaySchedule = ({ day, focus, exercises, onDaySelect, isActive, onRemoveExercise, onSetRestDay, isRestDay, t, onUpdateExercise, onUpdateFocus }: { day: string, focus: string, exercises: PlannedExercise[], onDaySelect: () => void, isActive: boolean, onRemoveExercise: (planId: string) => void, onSetRestDay: () => void, isRestDay: boolean, t: any, onUpdateExercise: (planId: string, field: keyof PlannedExercise, value: string) => void, onUpdateFocus: (newFocus: string) => void }) => {
    
    if (isRestDay) {
        return (
             <Card className="bg-muted/50 border-2 border-dashed">
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-semibold">{day} <span className="text-sm font-normal text-muted-foreground">{t.plans.focus.rest}</span></h3>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5 text-muted-foreground" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onSetRestDay} className="text-destructive focus:text-destructive">
                                    Quitar descanso
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="text-center py-10">
                     <div className="flex items-center justify-center h-16 w-16 rounded-full bg-background mx-auto">
                        <Bed className="h-8 w-8 text-primary"/>
                    </div>
                    <h4 className="font-semibold mt-4">{t.plans.activeRecovery}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{t.plans.recoveryDescription}</p>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card onClick={onDaySelect} className={cn("cursor-pointer transition-all", isActive ? 'border-primary shadow-lg' : 'hover:border-primary/50')}>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{day}</h3>
                      <Input 
                        value={focus} 
                        onChange={(e) => onUpdateFocus(e.target.value)}
                        placeholder="Enfoque del día..."
                        className="text-sm font-normal text-muted-foreground h-8 border-none bg-transparent focus-visible:ring-1 focus-visible:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5 text-muted-foreground" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onSetRestDay}>
                                {t.plans.markAsRestDay}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[100px]">
                {exercises.map((ex) => (
                    <PlannedExerciseCard key={ex.planId} exercise={ex} onRemove={() => onRemoveExercise(ex.planId)} onUpdate={onUpdateExercise} isRestDay={false} />
                ))}
                {isActive && (
                     <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                        <p>{t.plans.selectFromLibrary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function CreatePlanPage() {
    const { t } = useLanguage();
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [planName, setPlanName] = useState("Nuevo Plan de Entrenamiento");
    const [selectedClientId, setSelectedClientId] = useState<string | null>("template"); // 'template' for generic plans
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
    const [selectedDay, setSelectedDay] = useState<string>('Lunes');
    const [planState, setPlanState] = useState<PlanState>({});
    const [isPlanLoading, setIsPlanLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const planIdFromParams = searchParams.get('planId');
    const [currentPlanId, setCurrentPlanId] = useState<string | null>(planIdFromParams);

    const tenantId = user?.uid;

    const clientsCollectionRef = useMemoFirebase(
      () => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null),
      [firestore, tenantId]
    );
    const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsCollectionRef);

    const settingsDocRef = useMemoFirebase(
      () => (firestore && tenantId ? doc(firestore, `tenants/${tenantId}/settings`, 'preferences') : null),
      [firestore, tenantId]
    );
    const { data: settings, isLoading: areSettingsLoading } = useDoc<AppSettings>(settingsDocRef);

    const selectedClient = useMemo(() => clients?.find(c => c.id === selectedClientId), [clients, selectedClientId]);

    const exercisesCollectionRef = useMemoFirebase(
      () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/exercises`), orderBy("name", "asc")) : null),
      [firestore, tenantId]
    );
    const { data: exercises, isLoading: areExercisesLoading } = useCollection<ExerciseWithId>(exercisesCollectionRef);
    
    const filteredExercises = useMemo(() => exercises?.filter(ex => {
        const matchesType = filter === 'all' || ex.type === filter;
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    }), [exercises, filter, searchQuery]);
    
    const totalWeeksInMonth = 4;
    
    const weekDayMap = useMemo(() => ({
        'L': t.plans.day.monday,
        'M': t.plans.day.tuesday,
        'X': t.plans.day.wednesday,
        'J': t.plans.day.thursday,
        'V': t.plans.day.friday,
        'S': t.plans.day.saturday,
        'D': t.plans.day.sunday,
    }), [t]);
    
    const weekSchedule = useMemo(() => {
        const defaultFocus = [t.plans.focus.legs, t.plans.focus.push, t.plans.focus.pull, t.plans.focus.upper, t.plans.focus.full, t.plans.focus.rest, t.plans.focus.rest];
        const workingDays = settings?.workingDays || ['L', 'M', 'X', 'J', 'V'];
        
        return workingDays.map((day, index) => ({
            day: weekDayMap[day as keyof typeof weekDayMap],
            focus: defaultFocus[index % defaultFocus.length],
            id: day
        }));
    }, [settings, t, weekDayMap]);

    useEffect(() => {
        if (weekSchedule.length > 0) {
            setSelectedDay(weekSchedule[0].id);
        }
    }, [weekSchedule]);
    
    const filterButtons = useMemo(() => [{value: 'all', label: t.plans.all}, ...t.plans.exerciseTypeList], [t]);

    const fetchPlan = useCallback(async (planId: string) => {
        if (!firestore || !tenantId) return;

        setIsPlanLoading(true);
        const planDocRef = doc(firestore, `tenants/${tenantId}/mesocycles`, planId);
        
        try {
            const docSnap = await getDoc(planDocRef);
            if (docSnap.exists()) {
                const planData = docSnap.data() as Mesocycle;
                setPlanName(planData.name);
                setPlanState(planData.weeks);
                setCurrentPlanId(docSnap.id);
                setSelectedClientId(planData.clientId || "template");
            } else {
                toast({ variant: 'destructive', title: "Error", description: "El plan que intentas editar no existe."});
                router.push('/plans');
            }
        } catch (error) {
            console.error("Error fetching plan:", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo cargar el plan existente."});
        } finally {
            setIsPlanLoading(false);
        }
    }, [firestore, tenantId, toast, router]);

    useEffect(() => {
        if (planIdFromParams) {
            fetchPlan(planIdFromParams);
        }
    }, [planIdFromParams, fetchPlan]);

    const handleCreatePlan = useCallback(() => {
        const newPlan: PlanState = {};
        for (let i = 0; i < totalWeeksInMonth; i++) {
            newPlan[i] = weekSchedule.reduce((acc, day) => {
                acc[day.id] = { focus: day.focus, isRestDay: false, exercises: [] };
                return acc;
            }, {} as WeeklyPlan);
        }
        setPlanState(newPlan);
        setCurrentPlanId(null);
        setPlanName("Nuevo Plan de Entrenamiento");
        setSelectedClientId("template");
        toast({ title: "Nuevo Plan Creado", description: `Plan de 4 semanas listo para editar.` });
    }, [totalWeeksInMonth, weekSchedule, toast]);


    const handleAddExercise = (exercise: ExerciseWithId) => {
        if (!selectedDay) return;
        const currentDayPlan = planState[currentWeekIndex]?.[selectedDay];
        if (currentDayPlan?.isRestDay) {
            toast({ variant: 'destructive', title: "Día de Descanso", description: "No puedes añadir ejercicios a un día de descanso." });
            return;
        }

        setPlanState(prev => {
            const newPlan = { ...prev };
            const weekPlan = newPlan[currentWeekIndex] ? { ...newPlan[currentWeekIndex] } : {};
            const dayPlan = weekPlan[selectedDay] ? { ...weekPlan[selectedDay] } : { focus: '', isRestDay: false, exercises: [] };

            const newExercise: PlannedExercise = {
                id: exercise.id,
                name: exercise.name,
                imageUrl: exercise.imageUrl,
                muscleGroups: exercise.muscleGroups,
                planId: `${exercise.id}-${Date.now()}`,
                sets: '', reps: '', rpe: '', rest: '', duration: '',
            };
            
            dayPlan.exercises = [...dayPlan.exercises, newExercise];
            weekPlan[selectedDay] = dayPlan;
            newPlan[currentWeekIndex] = weekPlan;
            return newPlan;
        });
    }

    const handleRemoveExercise = (day: string, planId: string) => {
        setPlanState(prev => {
            const newPlan = { ...prev };
            if (!newPlan[currentWeekIndex] || !newPlan[currentWeekIndex][day]) return prev;

            newPlan[currentWeekIndex][day].exercises = newPlan[currentWeekIndex][day].exercises.filter(ex => ex.planId !== planId);
            return newPlan;
        });
    }
    
    const handleUpdateExercise = (day: string, planId: string, field: keyof PlannedExercise, value: string) => {
        setPlanState(prev => {
            const newPlan = JSON.parse(JSON.stringify(prev)); // Deep copy
            if (!newPlan[currentWeekIndex] || !newPlan[currentWeekIndex][day]) return prev;
    
            const dayExercises = newPlan[currentWeekIndex][day].exercises;
            const exerciseIndex = dayExercises.findIndex((ex: PlannedExercise) => ex.planId === planId);
            if (exerciseIndex > -1) {
                dayExercises[exerciseIndex][field] = value;
            }
            return newPlan;
        });
    };

    const handleUpdateFocus = (day: string, newFocus: string) => {
        setPlanState(prev => {
            const newPlan = JSON.parse(JSON.stringify(prev));
            if (newPlan[currentWeekIndex] && newPlan[currentWeekIndex][day]) {
                newPlan[currentWeekIndex][day].focus = newFocus;
            }
            return newPlan;
        });
    };

    const handleSetRestDay = (day: string) => {
        setPlanState(prev => {
            const newPlan = JSON.parse(JSON.stringify(prev)); 
    
            if (!newPlan[currentWeekIndex]) {
                newPlan[currentWeekIndex] = {};
            }
            if (!newPlan[currentWeekIndex][day]) {
                 const baseDay = weekSchedule.find(d => d.id === day) || { focus: 'Descanso', exercises: []};
                 newPlan[currentWeekIndex][day] = { focus: baseDay.focus, isRestDay: false, exercises: [] };
            }
    
            const currentIsRestDay = newPlan[currentWeekIndex][day].isRestDay;
            newPlan[currentWeekIndex][day].isRestDay = !currentIsRestDay;
    
            if (newPlan[currentWeekIndex][day].isRestDay) {
                newPlan[currentWeekIndex][day].exercises = [];
            }
    
            return newPlan;
        });
    }

    const handleSavePlan = async () => {
        if (!firestore || !tenantId) {
            toast({ variant: "destructive", title: "Error", description: "Faltan datos para guardar el plan." });
            return;
        }
        setIsSubmitting(true);
        try {
            // Create a deep copy and clean the plan before saving
            const cleanPlanState = JSON.parse(JSON.stringify(planState));
            for (const week in cleanPlanState) {
                for (const day in cleanPlanState[week]) {
                    cleanPlanState[week][day].exercises = cleanPlanState[week][day].exercises.map((ex: any) => ({
                        id: ex.id,
                        planId: ex.planId,
                        name: ex.name,
                        imageUrl: ex.imageUrl,
                        muscleGroups: ex.muscleGroups,
                        sets: ex.sets || '',
                        reps: ex.reps || '',
                        rpe: ex.rpe || '',
                        rest: ex.rest || '',
                        duration: ex.duration || '',
                    }));
                }
            }
            
            const planRef = currentPlanId 
                ? doc(firestore, `tenants/${tenantId}/mesocycles`, currentPlanId)
                : doc(collection(firestore, `tenants/${tenantId}/mesocycles`));
            
            const planData: Omit<Mesocycle, 'id' | 'createdAt'> & { createdAt?: any } = {
                clientId: selectedClientId === 'template' ? null : selectedClientId,
                name: planName,
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                weeks: cleanPlanState,
                updatedAt: serverTimestamp(),
            };

            if (!currentPlanId) {
                planData.createdAt = serverTimestamp();
            }
            
            await setDocumentNonBlocking(planRef, planData, { merge: false });

            if(!currentPlanId) setCurrentPlanId(planRef.id);

            toast({ variant: 'success', title: "Plan Guardado", description: "El plan de entrenamiento ha sido guardado correctamente." });
            router.push('/plans');
        } catch (error) {
            console.error("Error saving plan:", error);
            toast({ variant: 'destructive', title: "Error al Guardar", description: "No se pudo guardar el plan." });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleReplicatePreviousWeek = useCallback(() => {
        if (currentWeekIndex === 0) {
            toast({ variant: 'destructive', title: "Error", description: "No hay semana anterior para replicar." });
            return;
        }
    
        const previousWeekPlan = planState[currentWeekIndex - 1];
    
        if (!previousWeekPlan) {
            toast({ variant: 'destructive', title: "Semana Vacía", description: "La semana anterior está vacía." });
            return;
        }
    
        setPlanState(prev => {
            const newPlan = { ...prev };
            const replicatedWeekPlan = JSON.parse(JSON.stringify(previousWeekPlan));
            Object.keys(replicatedWeekPlan).forEach(dayId => {
                replicatedWeekPlan[dayId].exercises = replicatedWeekPlan[dayId].exercises.map((ex: PlannedExercise) => ({
                    ...ex,
                    planId: `${ex.id}-${Date.now()}-${Math.random()}`
                }));
            });
            newPlan[currentWeekIndex] = replicatedWeekPlan;
            return newPlan;
        });
    
        toast({ title: "Semana Replicada", description: "Se ha copiado el plan de la semana anterior." });
    }, [currentWeekIndex, planState, toast]);

    const { totalDuration, averageRpe } = useMemo(() => {
        let totalDuration = 0;
        let totalRpe = 0;
        let rpeCount = 0;

        const weekData = planState[currentWeekIndex];
        if (weekData) {
            Object.values(weekData).forEach(dayData => {
                if (!dayData.isRestDay) {
                    dayData.exercises.forEach(ex => {
                        const duration = parseInt(ex.duration, 10);
                        if (!isNaN(duration)) {
                            totalDuration += duration;
                        }
                        const rpe = parseFloat(ex.rpe);
                         if (!isNaN(rpe)) {
                            totalRpe += rpe;
                            rpeCount++;
                        }
                    });
                }
            });
        }

        const averageRpe = rpeCount > 0 ? (totalRpe / rpeCount) : 0;
        return { totalDuration, averageRpe: Number(averageRpe.toFixed(1)) };
    }, [planState, currentWeekIndex]);
    
    const getIntensityLabel = (rpe: number) => {
        if (rpe >= 9.5) return t.plans.intensityLabels.max;
        if (rpe >= 8) return t.plans.intensityLabels.high;
        if (rpe >= 7) return t.plans.intensityLabels.moderate;
        if (rpe > 0) return t.plans.intensityLabels.light;
        return 'N/A';
    }

  const isLoading = areClientsLoading || areExercisesLoading || areSettingsLoading;

  return (
    <div className="flex flex-col h-full">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <a onClick={() => router.push('/plans')} className="hover:text-primary transition-colors cursor-pointer">{t.plans.title}</a>
                <span>/</span>
                <span>{planIdFromParams ? 'Editar Plan' : t.plans.createNewPlan}</span>
            </div>
        </header>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {isLoading ? (
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4">
                     <div className="h-12 w-12 border-2 border-primary rounded-full flex items-center justify-center">
                        {selectedClientId === 'template' || !selectedClient ? (
                            <BookCopy className="h-6 w-6 text-primary" />
                        ) : (
                            <Avatar className="h-full w-full">
                                <AvatarImage src={selectedClient.avatarUrl} alt={selectedClient.name} data-ai-hint={selectedClient.avatarHint}/>
                                <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    <div>
                        <Input 
                            className="text-2xl font-bold font-headline p-0 h-auto border-none focus-visible:ring-0" 
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                        />
                         <Select value={selectedClientId || 'template'} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="w-auto border-none text-muted-foreground p-0 h-auto focus:ring-0">
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="template">Crear como Plantilla</SelectItem>
                                {clients?.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2">
                <Button variant="outline" disabled={isSubmitting}>
                    <Forward className="mr-2 h-4 w-4" /> {t.plans.sendToClient}
                </Button>
                <Button onClick={handleSavePlan} disabled={isSubmitting || Object.keys(planState).length === 0}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    {t.plans.savePlan}
                </Button>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-1 bg-card p-4 rounded-lg flex flex-col">
            <Button variant="outline" className="w-full mb-4" onClick={handleCreatePlan} disabled={!!planIdFromParams}>
                <Plus className="mr-2 h-4 w-4" /> {t.plans.createNewPlan}
            </Button>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.plans.searchExercises} className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                 {filterButtons.map(btn => (
                    <Button key={btn.value} size="sm" variant={filter === btn.value ? "secondary" : "ghost"} onClick={() => setFilter(btn.value)} className="shrink-0">
                        {btn.label}
                    </Button>
                ))}
            </div>
            <h3 className="text-sm font-semibold mb-2">{t.plans.exerciseLibrary}</h3>
            <div className="space-y-2 overflow-y-auto mb-4 flex-1">
                {areExercisesLoading && (
                    <div className='space-y-2'>
                        {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-[52px] w-full" />)}
                    </div>
                )}
                {!areExercisesLoading && filteredExercises?.map((ex) => {
                  const equipmentLabel = t.plans.equipmentList.find(e => e.value === ex.equipment)?.label;
                  const typeLabel = t.plans.exerciseTypeList.find(e => e.value === ex.type)?.label;
                  
                  const details = [
                    equipmentLabel && equipmentLabel.toLowerCase() !== 'sin equipamiento' ? equipmentLabel : null,
                    typeLabel
                  ].filter(Boolean).join(' • ');

                  return (
                    <Card key={ex.id} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-2 flex items-center gap-3">
                            <Image src={ex.imageUrl || 'https://picsum.photos/seed/placeholder/40/40'} alt={ex.name} width={40} height={40} className="rounded-md aspect-square object-cover" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{ex.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {details || 'Sin detalles'}
                                </p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAddExercise(ex)} disabled={Object.keys(planState).length === 0}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                  );
                })}
                 {!areExercisesLoading && filteredExercises?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t.plans.noExercises}</p>
                 )}
            </div>
            {!areExercisesLoading && (
                 <Button className="w-full bg-primary/20 text-primary hover:bg-primary/30 mt-auto" asChild>
                    <Link href="/plans/new-exercise">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t.plans.addNewExercise}
                    </Link>
                  </Button>
             )}
        </div>
        
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
             {isPlanLoading ? (
                 <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
             ) : Object.keys(planState).length === 0 ? (
                <Card className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-muted-foreground">Crea un nuevo plan para comenzar.</p>
                    </div>
                </Card>
            ) : (
                <>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekIndex(p => Math.max(0, p - 1))} disabled={currentWeekIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                            <div>
                                <CardTitle>{t.plans.weekScheduleTitle} {currentWeekIndex + 1}</CardTitle>
                                <CardDescription>{t.plans.weekScheduleDescription}</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekIndex(p => Math.min(totalWeeksInMonth - 1, p + 1))} disabled={currentWeekIndex >= totalWeeksInMonth - 1}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={handleReplicatePreviousWeek} disabled={currentWeekIndex === 0}>
                                <Copy className="mr-2 h-4 w-4" />
                                {t.plans.replicateWeek}
                            </Button>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">{t.plans.estDuration}</p>
                                <p className="font-bold">{totalDuration}m</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">{t.plans.intensity}</p>
                                <Badge variant={averageRpe > 0 ? "default" : "outline"} className="capitalize">{getIntensityLabel(averageRpe)}</Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <div className="space-y-6">
                    {weekSchedule.map((dayDataItem) => {
                        const dayPlan = planState[currentWeekIndex]?.[dayDataItem.id];
                        return (
                            <DaySchedule
                                key={dayDataItem.id}
                                day={dayDataItem.day}
                                focus={dayPlan?.focus || dayDataItem.focus}
                                exercises={dayPlan?.exercises || []}
                                onDaySelect={() => setSelectedDay(dayDataItem.id)}
                                isActive={selectedDay === dayDataItem.id}
                                onRemoveExercise={(planId) => handleRemoveExercise(dayDataItem.id, planId)}
                                onUpdateExercise={(planId, field, value) => handleUpdateExercise(dayDataItem.id, planId, field, value)}
                                onUpdateFocus={(newFocus) => handleUpdateFocus(dayDataItem.id, newFocus)}
                                onSetRestDay={() => handleSetRestDay(dayDataItem.id)}
                                isRestDay={dayPlan?.isRestDay || false}
                                t={t}
                            />
                        )
                    })}
                </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
