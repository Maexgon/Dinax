'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Plus, MoreVertical, GripVertical, Forward, Save, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import { mockTrainingPlans, mockClients } from '@/lib/data';
import type { Client, TrainingPlan, Exercise, ExerciseWithId } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const ExerciseCard = ({ exercise }: { exercise: Exercise }) => {
    const { t } = useLanguage();
    return (
        <Card className="shadow-md">
            <CardContent className="p-3">
                <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                     <Image src={exercise.imageUrl || exercise.image || 'https://picsum.photos/seed/placeholder/100/100'} alt={exercise.name} width={60} height={60} className="rounded-md object-cover" />
                    <div className="flex-1">
                        <p className="font-semibold">{exercise.name}</p>
                        {exercise.warmup ? (
                            <p className="text-xs text-primary">{exercise.warmup}</p>
                        ) : (
                            <div className='flex gap-1 mt-1'>
                                {exercise.muscleGroups?.slice(0, 2).map(m => <Badge key={m} variant="secondary" className='text-xs'>{m}</Badge>)}
                            </div>
                        )}
                    </div>
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                {exercise.sets && (
                <div className="grid grid-cols-4 gap-2 text-center mt-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.sets}</p>
                        <div className="p-2 bg-muted rounded-md mt-1 font-bold">{exercise.sets}</div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.reps}</p>
                        <div className="p-2 bg-muted rounded-md mt-1 font-bold">{exercise.reps}</div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rpe}</p>
                        <div className="p-2 bg-muted rounded-md mt-1 font-bold">{exercise.rpe}</div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t.plans.rest}</p>
                        <div className="p-2 bg-muted rounded-md mt-1 font-bold">{exercise.rest}</div>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    )
}

const DaySchedule = ({ day, focus, exercises, t }: { day: string, focus: string, exercises?: Exercise[], t: any }) => {
    
    if (!exercises || exercises.length === 0) {
        return (
             <Card className="bg-muted/50">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{day} <span className="text-sm font-normal text-muted-foreground">{focus}</span></h3>
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="text-center py-10">
                     <div className="flex items-center justify-center h-16 w-16 rounded-full bg-background mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <h4 className="font-semibold mt-4">{t.plans.activeRecovery}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{t.plans.recoveryDescription}</p>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{day} <span className="text-sm font-normal text-muted-foreground">{focus}</span></h3>
                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {exercises.map((ex, index) => (
                    <ExerciseCard key={index} exercise={ex} />
                ))}
                <Button variant="outline" className="w-full border-dashed">
                    <Plus className="mr-2 h-4 w-4" /> {t.plans.dragExercises}
                </Button>
            </CardContent>
        </Card>
    )
}

export default function PlansPage() {
    const { t } = useLanguage();
    const { firestore, user } = useFirebase();
    const plan = mockTrainingPlans[0];
    const client = mockClients[1];

    const tenantId = user?.uid;
    const exercisesCollectionRef = useMemoFirebase(
      () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/exercises`), orderBy("name", "asc")) : null),
      [firestore, tenantId]
    );

    const { data: exercises, isLoading: areExercisesLoading } = useCollection<ExerciseWithId>(exercisesCollectionRef);

    const weekSchedule = [
        { day: t.plans.day.monday, focus: t.plans.focus.legs, exercises: plan.microcycles[0].workouts.find(w => w.day === 'Monday')?.exercises },
        { day: t.plans.day.tuesday, focus: t.plans.focus.rest, exercises: [] },
        { day: t.plans.day.wednesday, focus: t.plans.focus.push, exercises: plan.microcycles[0].workouts.find(w => w.day === 'Wednesday')?.exercises },
        { day: t.plans.day.thursday, focus: t.plans.focus.rest, exercises: [] },
        { day: t.plans.day.friday, focus: t.plans.focus.pull, exercises: plan.microcycles[0].workouts.find(w => w.day === 'Friday')?.exercises },
    ]

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary">
            <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint={client.avatarHint}/>
            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold font-headline">{t.plans.planFor} {client.name}</h1>
            <p className="text-muted-foreground">
              {t.plans.planObjective}
            </p>
          </div>
        </div>
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
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.plans.searchExercises} className="pl-8" />
            </div>
            <div className="flex gap-2 mb-4">
                <Button size="sm" variant="secondary">{t.plans.all}</Button>
                <Button size="sm" variant="ghost">{t.plans.strength}</Button>
                <Button size="sm" variant="ghost">{t.plans.cardio}</Button>
                <Button size="sm" variant="ghost">{t.plans.plyo}</Button>
            </div>
            <h3 className="text-sm font-semibold mb-2">{t.plans.exerciseLibrary}</h3>
            <div className="space-y-2 overflow-y-auto mb-4">
                {areExercisesLoading && (
                    <div className='space-y-2'>
                        {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                )}
                {!areExercisesLoading && exercises?.map((ex) => (
                    <Card key={ex.id}>
                        <CardContent className="p-2 flex items-center gap-3">
                            <Image src={ex.imageUrl || 'https://picsum.photos/seed/placeholder/40/40'} alt={ex.name} width={40} height={40} className="rounded-md aspect-square object-cover" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{ex.name}</p>
                                <p className="text-xs text-muted-foreground">{ex.equipment}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                 {!areExercisesLoading && exercises?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t.plans.noExercises}</p>
                 )}
            </div>
             <Button className="w-full mt-auto" variant="secondary" asChild>
                <Link href="/plans/new-exercise">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t.plans.addNewExercise}
                </Link>
              </Button>
        </div>
        
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t.plans.weekScheduleTitle}</CardTitle>
                        <CardDescription>{t.plans.weekScheduleDescription}</CardDescription>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground">{t.plans.estDuration}</p>
                            <p className="font-bold">5h 30m</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{t.plans.intensity}</p>
                            <Badge variant="destructive">{t.plans.intensityHigh}</Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-6">
                {weekSchedule.map((dayData, index) => (
                    <DaySchedule key={index} day={dayData.day} focus={dayData.focus} exercises={dayData.exercises} t={t} />
                ))}
            </div>

            <Card className="mt-6 sticky bottom-4 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div >
                        <p className="font-semibold">{t.plans.weeklyTargets}</p>
                        <p className="text-sm text-muted-foreground">75% {t.dashboard.completed}</p>
                    </div>
                    <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-3/4 h-2 bg-primary rounded-full"></div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
