'use client';
import Link from 'next/link';
import {
  Users,
  Dumbbell,
  Wallet,
  Landmark,
  Play,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/context/language-context';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import type { UserProfile, Payment, CalendarEvent, Client } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import React, { useMemo } from 'react';

const paymentData = [
    { name: 'Pagado', value: 2450, color: 'hsl(var(--chart-1))' },
    { name: 'Pendiente', value: 450, color: 'hsl(var(--accent))' },
];


export default function Dashboard() {
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const tenantId = user?.uid;

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'user_profile', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfToday = startOfDay(now);
  const endOfToday = endOfDay(now);

  const clientsRef = useMemoFirebase(() => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null), [tenantId, firestore]);
  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsRef);

  const paymentsThisMonthRef = useMemoFirebase(() => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/payments`), where('paymentDate', '>=', startOfCurrentMonth), where('paymentDate', '<=', endOfCurrentMonth)) : null), [tenantId, firestore, startOfCurrentMonth, endOfCurrentMonth]);
  const { data: paymentsThisMonth, isLoading: arePaymentsLoading } = useCollection<Payment>(paymentsThisMonthRef);

  const eventsTodayRef = useMemoFirebase(() => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/events`), where('start', '>=', startOfToday), where('start', '<=', endOfToday)) : null), [tenantId, firestore, startOfToday, endOfToday]);
  const { data: eventsToday, isLoading: areEventsLoading } = useCollection<CalendarEvent>(eventsTodayRef);

  const dashboardStats = useMemo(() => {
    const totalClients = clients?.length || 0;
    
    const paidThisMonth = paymentsThisMonth?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) || 0;
    const pendingPayments = paymentsThisMonth?.filter(p => p.status === 'pending' || p.status === 'overdue').length || 0;
    
    const totalSessionsToday = eventsToday?.length || 0;
    const completedSessionsToday = eventsToday?.filter(e => ((e.end as Timestamp).toDate() < now)).length || 0;

    return {
      totalClients,
      paidThisMonth,
      pendingPayments,
      totalSessionsToday,
      completedSessionsToday,
    };
  }, [clients, paymentsThisMonth, eventsToday, now]);

  const isLoading = isProfileLoading || areClientsLoading || arePaymentsLoading || areEventsLoading;

  const formattedDate = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            {isProfileLoading ? (
                <>
                    <Skeleton className="h-9 w-64 mb-2"/>
                    <Skeleton className="h-5 w-80"/>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold font-headline">¡Hola, {userProfile?.firstName || 'Coach'}! 👋</h1>
                    <p className="text-muted-foreground">{t.dashboard.summary}</p>
                </>
            )}
          </div>
          <span className="text-sm text-muted-foreground capitalize">{formattedDate}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.activeStudents}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{dashboardStats.totalClients}</div>}
            <p className="text-xs text-primary/80">
              {t.dashboard.newStudents}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.trainingsToday}
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-3/4 mb-2" /> : <div className="text-2xl font-bold">{dashboardStats.completedSessionsToday} <span className="text-base text-muted-foreground">/ {dashboardStats.totalSessionsToday} {t.dashboard.sessions}</span></div>}
             {isLoading ? <Skeleton className="h-2 w-full mt-2" /> : <Progress value={dashboardStats.totalSessionsToday > 0 ? (dashboardStats.completedSessionsToday / dashboardStats.totalSessionsToday) * 100 : 0} className="h-2 mt-2" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.monthlyRevenue}</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">${dashboardStats.paidThisMonth.toFixed(2)}</div>}
            <p className="text-xs text-primary/80">
              +12%
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50/50 dark:border-primary/20 dark:bg-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.pendingPayments}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{dashboardStats.pendingPayments}</div>}
            <p className="text-xs text-orange-600 dark:text-primary/90">
              {t.dashboard.actionRequired}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.dashboard.nextSessions}</CardTitle>
            <Link href="/schedule" className="text-sm font-medium text-primary hover:underline">
                {t.dashboard.viewFullSchedule}
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground w-20">09:00 - 10:00</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1692197174597-1d85555c9b33?w=200" alt="Laura G." data-ai-hint="female athlete"/>
                            <AvatarFallback>LG</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Laura G.</p>
                            <p className="text-sm text-muted-foreground">Pierna & Glúteo</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">{t.dashboard.completed}</Badge>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary">
                <div className="text-xs text-muted-foreground w-20">10:30 - 11:30</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1662013606299-b8ff0a34efc0?w=200" alt="Carlos M." data-ai-hint="male athlete"/>
                            <AvatarFallback>CM</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Carlos M.</p>
                            <p className="text-sm text-muted-foreground">HIIT Intenso</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-primary/20 dark:text-primary/90">{t.dashboard.inProgress}</Badge>
                        <Button variant="ghost" size="icon" className="rounded-full bg-primary h-8 w-8 text-primary-foreground">
                            <Play className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
             </div>
             <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground w-20">12:00 - 13:00</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1758599880453-ba4b22553606?w=200" alt="Ana R." data-ai-hint="person yoga" />
                            <AvatarFallback>AR</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Ana R.</p>
                            <p className="text-sm text-muted-foreground">Yoga & Flexibilidad</p>
                        </div>
                    </div>
                    <Badge variant="outline">{t.dashboard.upcoming}</Badge>
                </div>
             </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.paymentStatus}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full flex justify-center items-center relative h-40">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                {paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color}/>
                                ))}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute text-center">
                            <p className="text-3xl font-bold">85%</p>
                            <p className="text-sm text-muted-foreground">{t.dashboard.collected}</p>
                         </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary"></span>
                                <span>{language === 'es' ? 'Pagado' : 'Paid'}</span>
                            </div>
                            <span>2.450€</span>
                        </div>
                         <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-accent"></span>
                                <span>{t.dashboard.pending}</span>
                            </div>
                            <span>450€</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">{t.dashboard.manageInvoices}</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>{t.dashboard.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                         <div className="h-5 w-5 rounded-full bg-orange-100 dark:bg-primary/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-orange-600 dark:text-primary/90" />
                        </div>
                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: t.dashboard.sofiaCompleted.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>') }} />
                        
                    </div>
                    <p className="text-xs text-muted-foreground ml-8 -mt-3">{t.dashboard.justNow}</p>
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <RefreshCw className="h-3 w-3 text-blue-600" />
                        </div>
                         <p className="text-sm" dangerouslySetInnerHTML={{ __html: t.dashboard.marcRegistered.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>') }} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-8 -mt-3">{t.dashboard.oneHourAgo}</p>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
