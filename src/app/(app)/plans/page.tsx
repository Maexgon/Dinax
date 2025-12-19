'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Copy, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/language-context';
import type { Mesocycle, Client, PlanSummary } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function PlanCardSkeleton() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="p-6 pb-4">
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton className="h-7 w-4/5 mb-2" />
                <Skeleton className="h-10 w-full mb-4" />
                <div className="space-y-3 mb-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
            </div>
            <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}

export default function PlansPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { firestore, user } = useFirebase();
    const tenantId = user?.uid;

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const mesocyclesQuery = useMemoFirebase(
        () => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/mesocycles`), orderBy('createdAt', 'desc')) : null),
        [firestore, tenantId]
    );
    const { data: mesocycles, isLoading: areMesocyclesLoading } = useCollection<Mesocycle>(mesocyclesQuery);

    const clientsQuery = useMemoFirebase(
        () => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null),
        [firestore, tenantId]
    );
    const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsQuery);
    
    const isLoading = areMesocyclesLoading || areClientsLoading;

    const planSummaries: PlanSummary[] = useMemo(() => {
        if (isLoading || !mesocycles || !clients) return [];
        return mesocycles.map(mesocycle => {
            const client = clients.find(c => c.id === mesocycle.clientId);
            let totalTrainingDays = 0;
            let totalDuration = 0;

            Object.values(mesocycle.weeks).forEach(week => {
                Object.values(week).forEach(day => {
                    if (!day.isRestDay && day.exercises.length > 0) {
                        totalTrainingDays++;
                        day.exercises.forEach(ex => {
                            totalDuration += parseInt(ex.duration || '0', 10);
                        });
                    }
                });
            });
            
            const numberOfWeeks = Object.keys(mesocycle.weeks).length;
            const averageTrainingDays = numberOfWeeks > 0 ? Math.round(totalTrainingDays / numberOfWeeks) : 0;
            const averageDuration = totalTrainingDays > 0 ? Math.round(totalDuration / totalTrainingDays) : 0;

            return {
                id: mesocycle.id,
                clientId: mesocycle.clientId,
                clientName: client?.name || 'Cliente no encontrado',
                clientAvatar: client?.avatarUrl || '',
                title: `${t.plans.months[mesocycle.month]} ${mesocycle.year}`,
                focus: "Hipertrofia", // Placeholder
                trainingDays: averageTrainingDays,
                duration: averageDuration,
            };
        });
    }, [isLoading, mesocycles, clients, t.plans.months]);

    const filteredPlans = useMemo(() => {
        return planSummaries.filter(plan => {
            const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plan.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
            // Filter logic can be extended here if needed
            // const matchesFilter = filter === 'all' || plan.focus.toLowerCase() === filter;
            return matchesSearch;
        });
    }, [planSummaries, searchQuery]);

    const filterButtons = [
        { value: 'all', label: t.plans.all },
        { value: 'fuerza', label: t.plans.strength },
        { value: 'cardio', label: t.plans.cardio },
        { value: 'plyo', label: t.plans.plyo },
    ];


    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold font-headline">Planes de Entrenamiento</h2>
                    <p className="text-muted-foreground">Gestiona y crea rutinas personalizadas</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => router.push('/plans/create')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nuevo Plan
                    </Button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="w-full pl-10"
                        placeholder="Buscar plan por nombre o cliente..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {filterButtons.map(btn => (
                        <Button key={btn.value} variant={filter === btn.value ? 'secondary' : 'ghost'} onClick={() => setFilter(btn.value)} className="shrink-0">
                            {btn.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <PlanCardSkeleton key={i} />)}

                {!isLoading && filteredPlans.map(plan => (
                     <Card key={plan.id} className="flex flex-col h-full group hover:border-primary/50 transition-all">
                        <CardHeader>
                             <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 capitalize">{plan.focus}</Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Copy className="mr-2 h-4 w-4" /> Duplicar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">{plan.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <Image src={plan.clientAvatar || ''} alt={plan.clientName || ''} width={24} height={24} className="rounded-full" />
                                {plan.clientName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    </span>
                                    <span className="font-medium">{plan.trainingDays} días / semana</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">timer</span>
                                    </span>
                                    <span className="font-medium">{plan.duration} min prom.</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/plans/edit/${plan.id}`}>Ver Detalle</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                 <Card className="border-2 border-dashed flex flex-col items-center justify-center min-h-[350px] hover:border-primary transition-colors">
                    <Button variant="ghost" className="h-20 w-20 rounded-full bg-muted mb-4" onClick={() => router.push('/plans/create')}>
                        <PlusCircle className="h-10 w-10 text-muted-foreground" />
                    </Button>
                    <h3 className="text-xl font-bold">Crear Nuevo Plan</h3>
                    <p className="text-muted-foreground text-sm">Diseña una rutina desde cero</p>
                </Card>
            </div>
        </div>
    );
}
