'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
    Bell,
    ChevronRight,
    Dumbbell,
    Flame,
    MessageSquare,
    Scale,
    Calendar as CalendarIcon,
    Play,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import type { UserProfile, Client, CalendarEvent, Payment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfDay } from 'date-fns';

export default function ClientDashboardPage() {
    const { user, firestore } = useFirebase();
    const { t } = useLanguage();

    // 1. Get User Profile to find Tenant ID
    const userProfileRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'user_profile', user.uid) : null),
        [firestore, user]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const tenantId = userProfile?.tenantId;
    const clientId = user?.uid;

    // 2. Get Client Data (under Tenant)
    const clientRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ? doc(firestore, `tenants/${tenantId}/user_profile`, clientId) : null),
        [firestore, tenantId, clientId]
    );
    const { data: client, isLoading: isClientLoading } = useDoc<Client>(clientRef);

    // 3. Get Upcoming Sessions
    const now = new Date();
    const startOfToday = startOfDay(now);

    const upcomingEventsRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ?
            query(
                collection(firestore, `tenants/${tenantId}/events`),
                where('clients', 'array-contains', clientId),
                where('start', '>=', startOfToday),
                orderBy('start', 'asc'),
                limit(5)
            ) : null),
        [firestore, tenantId, clientId]
    );
    const { data: upcomingEvents, isLoading: areEventsLoading } = useCollection<CalendarEvent>(upcomingEventsRef);

    // 4. Get Recent History (Past events or Payments)
    // For simplicity, let's fetch recent payments and recent completed events?
    // Let's just do payments for "Recent Activity" for now as per design usually.
    const paymentsRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ?
            query(
                collection(firestore, `tenants/${tenantId}/payments`),
                where('clientId', '==', clientId),
                orderBy('paymentDate', 'desc'),
                limit(5)
            ) : null),
        [firestore, tenantId, clientId]
    );
    const { data: recentPayments, isLoading: arePaymentsLoading } = useCollection<Payment>(paymentsRef);


    // Derived State
    const nextSession = upcomingEvents?.find(e => {
        const start = e.start instanceof Timestamp ? e.start.toDate() : new Date(e.start);
        return start > now;
    });

    const activePlanName = client?.planType || 'Sin Plan Activo';
    const planProgress = client?.progress || 0;

    const firstName = userProfile?.firstName || client?.name?.split(' ')[0] || 'Atleta';

    const weight = client?.profile?.weight ? `${client.profile.weight} kg` : '--';
    //   const bodyFat = client?.profile?.bodyFat ? `${client.profile.bodyFat}%` : '--'; // Not in profile type yet
    const streak = '3 días'; // Placeholder until we calculate streak logic

    const isLoading = isProfileLoading || isClientLoading || areEventsLoading;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-6">
            {/* Header */}
            <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b md:border-none">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Hola, {firstName}</h1>
                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
                    </Button>
                    <Link href="/clients/profile">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={client?.avatarUrl} />
                            <AvatarFallback>{firstName[0]}</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </header>

            <div className="px-6 space-y-6">

                {/* Active Plan Status */}
                <section>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tu Plan</h2>
                        <Badge variant="outline" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">En Progreso</Badge>
                    </div>
                    <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{activePlanName}</h3>
                                    <p className="text-sm text-muted-foreground">Fase 2 - Hipertrofia</p>
                                </div>
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Dumbbell className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progreso del ciclo</span>
                                    <span className="font-semibold">{planProgress}%</span>
                                </div>
                                <Progress value={planProgress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Today's Session */}
                <section>
                    <h2 className="text-lg font-bold mb-3">Próxima Sesión</h2>
                    {nextSession ? (
                        <Card className="border shadow-sm overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-0">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="secondary" className="mb-2">
                                            {nextSession.start instanceof Timestamp ? nextSession.start.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}
                                        </Badge>
                                        {nextSession.type === 'group' && <Badge>Grupal</Badge>}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 leading-tight">{nextSession.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                                        <Clock className="h-4 w-4" />
                                        <span>60 min</span>
                                        <span className="text-border">|</span>
                                        <span>{nextSession.location || 'Gimnasio Principal'}</span>
                                    </div>
                                    <Button className="w-full text-base font-semibold shadow-lg shadow-primary/20" size="lg">
                                        <Play className="h-4 w-4 mr-2 fill-current" />
                                        Comenzar Entrenamiento
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-2 bg-muted/20">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="font-medium text-muted-foreground">¡Todo listo por hoy!</p>
                                <p className="text-sm text-muted-foreground/80 mt-1">Disfruta tu descanso.</p>
                                <Button variant="link" className="mt-2 text-primary">Ver Agenda Completa</Button>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Quick Stats Grid */}
                <section className="grid grid-cols-3 gap-3">
                    <Card className="bg-card shadow-sm border-none ring-1 ring-border">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[100px]">
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                                <Scale className="h-4 w-4" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-0.5">Peso</span>
                            <span className="font-bold text-lg">{weight}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-sm border-none ring-1 ring-border">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[100px]">
                            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
                                <Flame className="h-4 w-4" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-0.5">Racha</span>
                            <span className="font-bold text-lg">{streak}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-sm border-none ring-1 ring-border">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[100px]">
                            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-2">
                                <Dumbbell className="h-4 w-4" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-0.5">Sesiones</span>
                            <span className="font-bold text-lg">12</span>
                        </CardContent>
                    </Card>
                </section>

                {/* Quick Actions Scroll */}
                <section>
                    <h2 className="text-lg font-bold mb-3">Acciones Rápidas</h2>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-4 pb-4">
                            <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[100px] border-dashed">
                                <Scale className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs font-normal">Registrar Peso</span>
                            </Button>
                            <Link href="/clients/messages">
                                <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[100px] border-dashed">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-xs font-normal">Enviar Mensaje</span>
                                </Button>
                            </Link>
                            <Link href="/clients/calendar">
                                <Button variant="outline" className="h-auto flex-col gap-2 p-4 min-w-[100px] border-dashed">
                                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-xs font-normal">Ver Agenda</span>
                                </Button>
                            </Link>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </section>

                {/* Recent Activity / History */}
                <section className="pb-8">
                    <h2 className="text-lg font-bold mb-3">Actividad Reciente</h2>
                    <div className="space-y-4">
                        {recentPayments?.map(payment => (
                            <div key={payment.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {payment.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">Pago de Membresía</p>
                                    <p className="text-xs text-muted-foreground">
                                        {payment.paymentDate instanceof Timestamp ? payment.paymentDate.toDate().toLocaleDateString() : 'Fecha desconocida'}
                                    </p>
                                </div>
                                <div className="font-bold text-sm">
                                    ${payment.amount}
                                </div>
                            </div>
                        ))}
                        {!recentPayments?.length && (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
