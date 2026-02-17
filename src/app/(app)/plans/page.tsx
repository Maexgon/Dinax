
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Copy, PlusCircle, Search, CalendarDays, Timer, User, BookCopy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/context/language-context';
import type { Mesocycle, Client, PlanSummary } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const { toast } = useToast();
    const tenantId = user?.uid;

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [planToDelete, setPlanToDelete] = useState<PlanSummary | null>(null);

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

    const handleDuplicateAndAssign = async (plan: PlanSummary) => {
        if (!firestore || !tenantId) return;

        const originalPlan = mesocycles?.find(m => m.id === plan.id);
        if (!originalPlan) {
            toast({ variant: 'destructive', title: 'Error', description: 'Plan original no encontrado.' });
            return;
        }

        // Deep copy and clean the plan to be duplicated
        const newPlanData = JSON.parse(JSON.stringify(originalPlan));
        delete newPlanData.id; // Remove original ID
        newPlanData.createdAt = serverTimestamp();
        newPlanData.updatedAt = serverTimestamp();
        // Set clientId to null initially, it will be assigned in the create page
        newPlanData.clientId = null;

        try {
            const newPlanRef = doc(collection(firestore, `tenants/${tenantId}/mesocycles`));
            await addDocumentNonBlocking(newPlanRef, { ...newPlanData });

            toast({ variant: 'success', title: 'Plan Duplicado', description: `Se creó una copia de "${plan.name}". Ahora puedes asignarlo.` });
            router.push(`/plans/create?planId=${newPlanRef.id}&assign=true`);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo duplicar el plan.' });
        }
    };

    const handleDeletePlan = (plan: PlanSummary) => {
        setPlanToDelete(plan);
    };

    const confirmDelete = async () => {
        const plan = planToDelete;
        if (!firestore || !tenantId || !plan) return;

        // 1. Close the dialog immediately.
        setPlanToDelete(null);

        // 2. Wait a small amount of time (100ms) to allow the Dialog close animation to finish 
        // and, crucially, for Radix UI to return focus to the "trigger" element or body.
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const planRef = doc(firestore, `tenants/${tenantId}/mesocycles`, plan.id);
            await deleteDocumentNonBlocking(planRef);

            toast({ variant: 'success', title: 'Plan Eliminado', description: `La rutina "${plan.name}" ha sido eliminada.` });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el plan.' });
        }
    };

    const planSummaries: PlanSummary[] = useMemo(() => {
        if (isLoading || !mesocycles) return [];
        return mesocycles.map(mesocycle => {
            const client = clients?.find(c => c.id === mesocycle.clientId);
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

            const focus = Object.values(mesocycle.weeks?.[0] || {}).find(day => !day.isRestDay)?.focus || "General";

            return {
                id: mesocycle.id,
                clientId: mesocycle.clientId,
                clientName: client?.name,
                clientAvatar: client?.avatarUrl,
                name: mesocycle.name,
                focus: focus,
                trainingDays: averageTrainingDays,
                duration: averageDuration,
            };
        });
    }, [isLoading, mesocycles, clients]);

    const filteredPlans = useMemo(() => {
        if (!planSummaries) return [];
        return planSummaries.filter(plan => {
            const query = searchQuery.toLowerCase();
            const matchesPlanName = plan.name && plan.name.toLowerCase().includes(query);
            const matchesClientName = plan.clientName && plan.clientName.toLowerCase().includes(query);

            if (query === '') return true;

            return matchesPlanName || matchesClientName;
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {isLoading && Array.from({ length: 4 }).map((_, i) => <PlanCardSkeleton key={i} />)}

                {!isLoading && filteredPlans.map(plan => (
                    <Card key={plan.id} className="flex flex-col h-full group hover:border-primary/50 transition-all">
                        <CardHeader className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 capitalize">{plan.focus}</Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleDuplicateAndAssign(plan)}>
                                            <Copy className="mr-2 h-4 w-4" /> Duplicar y Asignar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeletePlan(plan)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Plan
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{plan.name || 'Plan sin nombre'}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1 text-xs h-5">
                                {plan.clientId && plan.clientName ? (
                                    <>
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={plan.clientAvatar} alt={plan.clientName} />
                                            <AvatarFallback>{plan.clientName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{plan.clientName}</span>
                                    </>
                                ) : (
                                    <>
                                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                                        <span className="italic text-muted-foreground">Plantilla</span>
                                    </>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{plan.trainingDays} días / semana</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <Timer className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{plan.duration} min prom.</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={`/plans/create?planId=${plan.id}`}>Ver Detalle</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                <Card className="border-2 border-dashed flex flex-col items-center justify-center min-h-[280px] hover:border-primary transition-colors">
                    <Button variant="ghost" className="h-20 w-20 rounded-full bg-muted mb-4" onClick={() => router.push('/plans/create')}>
                        <PlusCircle className="h-10 w-10 text-muted-foreground" />
                    </Button>
                    <h3 className="text-xl font-bold">Crear Nuevo Plan</h3>
                    <p className="text-muted-foreground text-sm">Diseña una rutina desde cero</p>
                </Card>
            </div>

            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la rutina
                            <span className="font-medium text-foreground"> "{planToDelete?.name}" </span>
                            y la removerá de nuestros servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

