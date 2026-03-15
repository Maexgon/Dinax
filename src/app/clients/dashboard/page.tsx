'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Dumbbell, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { type Client } from '@/lib/types';

export default function ClientDashboard() {
    const { user, firestore } = useFirebase();
    const [clientData, setClientData] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextSession, setNextSession] = useState<any>(null); // Type this properly later

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                // 1. Get User Profile to find Tenant and Client ID
                const userProfileRef = doc(firestore, 'users', user.uid);
                const userProfileSnap = await getDoc(userProfileRef);

                if (userProfileSnap.exists()) {
                    const profileData = userProfileSnap.data();
                    const { tenantId, clientId } = profileData;

                    if (tenantId && clientId) {
                        // 2. Fetch Client Details from Coach's Tenant
                        // New Schema: tenants/{tenantId}/clients/{clientId}
                        const clientRef = doc(firestore, `tenants/${tenantId}/clients/${clientId}`);
                        const clientSnap = await getDoc(clientRef);

                        if (clientSnap.exists()) {
                            setClientData(clientSnap.data() as Client);
                        } else {
                            console.warn("Client document not found at", clientRef.path);
                        }

                        // 3. Fetch Next Session (Mock logic with real data structure for now)
                        // In Phase 2 we will query calendar_events filtered by clientId
                        setNextSession({
                            title: 'Entrenamiento Tarde',
                            time: '19:00 hs',
                            location: 'Gimnasio Principal',
                            date: 'Mañana',
                            type: 'General'
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, firestore]);

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    // Fallback if no specific next session
    const sessionDisplay = nextSession || {
        title: 'Sin sesión programada',
        time: '--:--',
        location: '-',
        date: '-',
        type: 'Descanso'
    };

    const progress = clientData?.progress || 0;
    const currentWeight = clientData?.profile?.weight || '--';

    return (
        <div className="space-y-6">
            {/* Welcome Section (Handled in Header mostly, but we can add context) */}

            {/* Next Session Card - Prominent */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Próximo Entrenamiento
                    </h3>
                    <Link href="/clients/calendar" className="text-xs text-primary font-medium hover:underline">
                        Ver Agenda
                    </Link>
                </div>
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                                    {sessionDisplay.date} • {sessionDisplay.time}
                                </p>
                                <h4 className="text-xl font-bold font-headline mb-1">
                                    {sessionDisplay.title}
                                </h4>
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <MapPin className="h-3 w-3" />
                                    {sessionDisplay.location}
                                </div>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Dumbbell className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button className="w-full" size="sm">
                                Ver Detalles
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Progress Section */}
            <section className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="relative h-20 w-20 mb-2">
                            {/* Simple CSS Circle or SVG for Progress */}
                            <svg className="h-full w-full transform -rotate-90">
                                <circle
                                    className="text-muted/20"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="36"
                                    cx="40"
                                    cy="40"
                                />
                                <circle
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeWidth="8"
                                    strokeDasharray={226} // 2 * pi * 36
                                    strokeDashoffset={226 - (226 * progress) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="36"
                                    cx="40"
                                    cy="40"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                {progress}%
                            </span>
                        </div>
                        <p className="text-sm font-medium">Meta Semanal</p>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-2 text-center">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-2xl font-bold">{currentWeight}kg</p>
                            <p className="text-xs text-muted-foreground">Peso Actual</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Quick Actions / Shortcuts */}
            <section>
                <h3 className="font-semibold text-lg mb-3">Accesos Rápidos</h3>
                <div className="grid grid-cols-1 gap-3">
                    <Link href="/clients/plan">
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                        <Dumbbell className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Mi Plan</p>
                                        <p className="text-xs text-muted-foreground">Ver rutina completa</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>
        </div>
    );
}
