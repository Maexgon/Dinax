'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, Timestamp, orderBy, doc } from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    ChevronRight,
    Dumbbell
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent, UserProfile } from '@/lib/types';

export default function ClientCalendarPage() {
    const { t, language } = useLanguage();
    const { firestore, user } = useFirebase();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // 1. Get Tenant ID
    const userProfileRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'user_profile', user.uid) : null),
        [firestore, user]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
    const tenantId = userProfile?.tenantId;
    const clientId = user?.uid;

    // 2. Fetch Events for the current month view (plus buffer maybe? or just fetch all future/recent?)
    // Fetching by month range is efficient.
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const eventsRef = useMemoFirebase(
        () => (firestore && tenantId && clientId ?
            query(
                collection(firestore, `tenants/${tenantId}/events`),
                where('clients', 'array-contains', clientId),
                where('start', '>=', subMonths(monthStart, 1)), // Fetch bits of prev/next month for transitions
                where('start', '<=', addMonths(monthEnd, 1))
            ) : null),
        [firestore, tenantId, clientId, monthStart, monthEnd]
    );

    // Note: Firestore inequalities on different fields are tricky. 
    // 'clients' array-contains AND 'start' range works if composite index exists.
    // If not, we might need client-side filtering or just range.
    // Let's rely on range primarily and client-side filter if needed? 
    // Actually, 'array-contains' + range is allowed in Firestore.
    const { data: events, isLoading: areEventsLoading } = useCollection<CalendarEvent>(eventsRef);

    const daysWithEvents = useMemo(() => {
        if (!events) return [];
        return events.map(e => (e.start as Timestamp).toDate());
    }, [events]);

    const selectedDateEvents = useMemo(() => {
        if (!events || !date) return [];
        return events.filter(e => isSameDay((e.start as Timestamp).toDate(), date))
            .sort((a, b) => (a.start as Timestamp).toMillis() - (b.start as Timestamp).toMillis());
    }, [events, date]);

    const isLoading = isProfileLoading || areEventsLoading;

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-6 p-4 space-y-4">
            <header className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold font-headline">Mi Agenda</h1>
                    <p className="text-muted-foreground text-sm">Gestiona tus entrenamientos</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => setDate(new Date())}>
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Calendar Widget */}
                <Card className="md:w-auto h-fit">
                    <CardContent className="p-0 flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            locale={language === 'es' ? es : undefined}
                            className="rounded-md border-none"
                            modifiers={{
                                hasEvent: daysWithEvents
                            }}
                            modifiersStyles={{
                                hasEvent: {
                                    fontWeight: 'bold',
                                    textDecoration: 'underline decoration-primary decoration-2 underline-offset-4'
                                }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Selected Day Agenda */}
                <div className="flex-1 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Sesiones del {date?.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>

                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                    ) : selectedDateEvents.length > 0 ? (
                        selectedDateEvents.map(event => (
                            <Card key={event.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="flex flex-col items-center justify-center min-w-[3.5rem] border-r pr-4">
                                        <span className="text-xl font-bold">
                                            {event.start instanceof Timestamp ? format(event.start.toDate(), 'HH:mm') : ''}
                                        </span>
                                        <span className="text-xs text-muted-foreground uppercase">
                                            {event.start instanceof Timestamp ? format(event.start.toDate(), 'a') : ''}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg leading-none">{event.title}</h3>
                                            {event.completed && <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Completada</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>60 min</span>
                                            {event.location && (
                                                <>
                                                    <span className="text-border mx-1">|</span>
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{event.location}</span>
                                                </>
                                            )}
                                        </div>
                                        {event.workPlan && (
                                            <p className="text-sm mt-2 p-2 bg-muted/50 rounded-md line-clamp-2">
                                                {event.workPlan}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Dumbbell className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-lg">Sin sesiones programadas</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                No tienes entrenamientos planificados para este día. ¡Es un buen momento para descansar o hacer estiramientos!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
