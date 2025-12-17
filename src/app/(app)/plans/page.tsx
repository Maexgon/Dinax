
'use client';
import { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, MoreVertical, GripVertical, Forward, Save, PlusCircle, Trash2, Moon, ChevronLeft, ChevronRight, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import type { Client, TrainingPlan, Exercise, ExerciseWithId, Workout } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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


type PlannedExercise = ExerciseWithId & { planId: string; };

const PlannedExerciseCard = ({ exercise, onRemove }: { exercise: PlannedExercise, onRemove: (planId: string) => void }) => {
    const { t } = useLanguage();
    return (
        <Card className="shadow-md bg-background relative group">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                     <Image src={exercise.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt={exercise.name} width={60} height={60} className="rounded-md object-cover" />
                    <div className="flex-1">
                        <p className="font-semibold">{exercise.name}</p>
                        <div className='flex gap-1 mt-1'>
                            {exercise.muscleGroups?.slice(0, 2).map(m => <Badge key={m} variant="secondary" className='text-xs'>{m}</Badge>)}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(exercise.planId)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mt-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.sets}</p>
                        <Input className="p-2 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.reps}</p>
                        <Input className="p-2 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-"/>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rpe}</p>
                        <Input className="p-2 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-"/>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rest}</p>
                        <Input className="p-2 bg-muted rounded-md mt-1 font-bold text-center h-8" placeholder="-"/>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const DaySchedule = ({ day, focus, exercises, onDaySelect, isActive, onAddExercise, onRemoveExercise, onSetRestDay, isRestDay, t }: { day: string, focus: string, exercises: PlannedExercise[], onDaySelect: () => void, isActive: boolean, onAddExercise: (ex: ExerciseWithId) => void, onRemoveExercise: (planId: string) => void, onSetRestDay: () => void, isRestDay: boolean, t: any }) => {
    
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
                    <h3 className="text-lg font-semibold">{day} <span className="text-sm font-normal text-muted-foreground">{focus}</span></h3>
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
                    <PlannedExerciseCard key={ex.planId} exercise={ex} onRemove={onRemoveExercise} />
                ))}
                {isActive && (
                    <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                        <p>{t.plans.dragExercises}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function PlansPage() {
    const { t } = useLanguage();
    const { firestore, user } = useFirebase();
    
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [weeklyPlan, setWeeklyPlan] = useState<Record<string, PlannedExercise[]>>({
      'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': []
    });

    const tenantId = user?.uid;

    const clientsCollectionRef = useMemoFirebase(
      () => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null),
      [firestore, tenantId]
    );
    const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsCollectionRef);

    useEffect(() => {
        if (clients && clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].id);
        }
    }, [clients, selectedClientId]);

    const selectedClient = clients?.find(c => c.id === selectedClientId);

    const exercisesCollectionRef = useMemoFirebase(
      () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/exercises`), orderBy("name", "asc")) : null),
      [firestore, tenantId]
    );

    const { data: exercises, isLoading: areExercisesLoading } = useCollection<ExerciseWithId>(exercisesCollectionRef);
    
    const filteredExercises = exercises?.filter(ex => {
        const matchesType = filter === 'all' || ex.type === filter;
        const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });
    
    const filterButtons = [{value: 'all', label: t.plans.all}, ...t.plans.exerciseTypeList];

    const weekSchedule = [
        { day: t.plans.day.monday, focus: t.plans.focus.legs, id: 'Monday' },
        { day: t.plans.day.tuesday, focus: 'Push', id: 'Tuesday' },
        { day: t.plans.day.wednesday, focus: t.plans.focus.pull, id: 'Wednesday' },
        { day: t.plans.day.thursday, focus: 'Upper Body', id: 'Thursday' },
        { day: t.plans.day.friday, focus: 'Full Body', id: 'Friday' },
    ]
    
    const years = ['2025', '2026', '2027'];
    const months = t.plans.months;
    const uniqueId = useId();

    const handleAddExercise = (exercise: ExerciseWithId) => {
        if (!selectedDay) return;
        setWeeklyPlan(prev => ({
            ...prev,
            [selectedDay]: [...prev[selectedDay], { ...exercise, planId: `${exercise.id}-${Date.now()}` }]
        }));
    }

    const handleRemoveExercise = (day: string, planId: string) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: prev[day].filter(ex => ex.planId !== planId)
        }));
    }

    const handleSetRestDay = (day: string) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: prev[day][0]?.name === 'Rest Day' ? [] : [{id: 'rest', name: 'Rest Day', planId: 'rest-day'}]
        }))
    }
    
    const isRestDay = (day: string) => {
        return weeklyPlan[day]?.[0]?.name === 'Rest Day';
    }


  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {selectedClient ? (
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={selectedClient.avatarUrl} alt={selectedClient.name} data-ai-hint={selectedClient.avatarHint}/>
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <Select value={selectedClientId || ''} onValueChange={setSelectedClientId}>
                        <SelectTrigger className="w-[200px] border-none text-2xl font-bold font-headline p-0 h-auto focus:ring-0">
                            <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {areClientsLoading && <div className="p-4 text-center text-sm">Cargando...</div>}
                            {!areClientsLoading && clients?.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-muted-foreground">
                    {t.plans.planObjective}
                    </p>
                </div>
            </div>
        ) : areClientsLoading ? (
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        ) : (
             <div>
                <h1 className="text-2xl font-bold font-headline">Selecciona un cliente</h1>
                <p className="text-muted-foreground">Elige un cliente para empezar a planificar.</p>
            </div>
        )}
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Forward className="mr-2 h-4 w-4" /> {t.plans.sendToClient}
            </Button>
            <Button>
                <Save className="mr-2 h-4 w-4" /> {t.plans.savePlan}
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Exercise Library */}
        <div className="lg:col-span-1 bg-card p-4 rounded-lg flex flex-col">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full mb-4">
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
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAddExercise(ex)}>
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
        
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                         <div>
                            <CardTitle>{t.plans.weekScheduleTitle}</CardTitle>
                            <CardDescription>{t.plans.weekScheduleDescription}</CardDescription>
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">{t.plans.estDuration}</p>
                            <p className="font-bold">0h 0m</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t.plans.intensity}</p>
                            <Badge variant="outline">N/A</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-6">
                {weekSchedule.map((dayData) => (
                    <DaySchedule
                        key={dayData.id}
                        day={dayData.day}
                        focus={dayData.focus}
                        exercises={weeklyPlan[dayData.id] || []}
                        onDaySelect={() => setSelectedDay(dayData.id)}
                        isActive={selectedDay === dayData.id}
                        onAddExercise={handleAddExercise}
                        onRemoveExercise={(planId) => handleRemoveExercise(dayData.id, planId)}
                        onSetRestDay={() => handleSetRestDay(dayData.id)}
                        isRestDay={isRestDay(dayData.id)}
                        t={t}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
