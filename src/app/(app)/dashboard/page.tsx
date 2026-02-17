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
import React, { useMemo, useState } from 'react';
import { AttendanceModal } from '@/components/dashboard/AttendanceModal';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();
  const tenantId = user?.uid;

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsAttendanceModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedEvent(null);
  };

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'user_profile', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Fix for flickering: 'now' was being recreated on every render, causing 
  // dashboardStats useMemo to re-run and potential loops if other hooks depend on it.
  const now = useMemo(() => new Date(), []); // Evaluate 'now' only once on mount.

  const startOfCurrentMonth = useMemo(() => startOfMonth(now), [now]);
  const endOfCurrentMonth = useMemo(() => endOfMonth(now), [now]);
  const startOfToday = useMemo(() => startOfDay(now), [now]);
  const endOfToday = useMemo(() => endOfDay(now), [now]);

  const clientsRef = useMemoFirebase(() => (firestore && tenantId ? collection(firestore, `tenants/${tenantId}/user_profile`) : null), [tenantId, firestore]);
  const { data: clients, isLoading: areClientsLoading } = useCollection<Client>(clientsRef);

  const paymentsThisMonthRef = useMemoFirebase(() => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/payments`), where('paymentDate', '>=', startOfCurrentMonth), where('paymentDate', '<=', endOfCurrentMonth)) : null), [tenantId, firestore, startOfCurrentMonth, endOfCurrentMonth]);
  const { data: paymentsThisMonth, isLoading: arePaymentsLoading } = useCollection<Payment>(paymentsThisMonthRef);

  const eventsTodayRef = useMemoFirebase(() => (firestore && tenantId ? query(collection(firestore, `tenants/${tenantId}/events`), where('start', '>=', startOfToday), where('start', '<=', endOfToday)) : null), [tenantId, firestore, startOfToday, endOfToday]);
  const { data: eventsToday, isLoading: areEventsLoading } = useCollection<CalendarEvent>(eventsTodayRef);

  const dashboardStats = useMemo(() => {
    const totalClients = clients?.length || 0;

    // Clients who haven't paid this month
    const clientsWithPayments = new Set(paymentsThisMonth?.map(p => p.clientId));
    const pendingPaymentsCount = clients?.filter(c => !clientsWithPayments.has(c.id)).length || 0;

    const totalSessionsToday = eventsToday?.length || 0;
    const completedSessionsToday = eventsToday?.filter(e => e.completed).length || 0;

    const nextSessions = eventsToday
      ?.filter(e => (e.start as Timestamp).toDate() > now)
      .sort((a, b) => (a.start as Timestamp).toMillis() - (b.start as Timestamp).toMillis())
      .slice(0, 3)
      .map(event => {
        const clientId = event.clients && event.clients.length > 0 ? event.clients[0] : null;
        const client = clients?.find(c => c.id === clientId);
        return {
          ...event,
          client
        };
      }) || [];

    const recentActivity = paymentsThisMonth
      ?.sort((a, b) => (b.paymentDate as Timestamp).toMillis() - (a.paymentDate as Timestamp).toMillis())
      .slice(0, 3)
      .map(payment => {
        const client = clients?.find(c => c.id === payment.clientId);
        return {
          type: 'payment',
          clientName: client?.name || 'Cliente',
          action: payment.status === 'paid' ? 'realizó un pago' : 'tiene un pago pendiente', // Fallback text, ideally use translations
          date: (payment.paymentDate as Timestamp).toDate(),
        };
      }) || [];

    return {
      totalClients,
      pendingPayments: pendingPaymentsCount,
      totalSessionsToday,
      completedSessionsToday,
      nextSessions,
      recentActivity,
    };
  }, [clients, paymentsThisMonth, eventsToday, now, t]);

  const isLoading = isProfileLoading || areClientsLoading || arePaymentsLoading || areEventsLoading;

  const formattedDate = new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  // Re-calculating payment stats to include pending amount
  const paymentStats = useMemo(() => {
    const paid = paymentsThisMonth?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) || 0;
    const pending = paymentsThisMonth?.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0) || 0;
    const total = paid + pending;
    const collectedPercentage = total > 0 ? Math.round((paid / total) * 100) : 0;

    return {
      paid,
      pending,
      collectedPercentage,
      chartData: [
        { name: language === 'es' ? 'Pagado' : 'Paid', value: paid, color: 'hsl(var(--chart-1))' },
        { name: language === 'es' ? 'Pendiente' : 'Pending', value: pending, color: 'hsl(var(--chart-2))' },
      ]
    };
  }, [paymentsThisMonth, language]);


  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            {isProfileLoading ? (
              <>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
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
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">${paymentStats.paid.toFixed(2)}</div>}
            <p className="text-xs text-primary/80">
              {/* +12% -  TODO: Calculate vs last month */}
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
            {dashboardStats.nextSessions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No hay más sesiones por hoy
              </div>
            ) : (
              dashboardStats.nextSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleEventClick(session)}
                >
                  <div className="text-xs text-muted-foreground w-20">
                    {session.start ? (session.start as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    -
                    {session.end ? (session.end as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.client?.avatarUrl} alt={session.client?.name} data-ai-hint={session.client?.avatarHint} />
                        <AvatarFallback>{session.client?.name?.substring(0, 2).toUpperCase() || 'CLI'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{session.client?.name || 'Cliente'}</p>
                        <p className="text-sm text-muted-foreground">{session.title}</p>
                      </div>
                    </div>
                    {session.completed ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Completada</Badge>
                    ) : (
                      <Badge variant="outline">{t.dashboard.upcoming}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
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
                    <Pie data={paymentStats.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                      {paymentStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-3xl font-bold">{paymentStats.collectedPercentage}%</p>
                  <p className="text-sm text-muted-foreground">{t.dashboard.collected}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span>{language === 'es' ? 'Pagado' : 'Paid'}</span>
                  </div>
                  <span>${paymentStats.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent"></span>
                    <span>{t.dashboard.pending}</span>
                  </div>
                  <span>${paymentStats.pending.toFixed(2)}</span>
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
              {dashboardStats.recentActivity.length > 0 ? (
                dashboardStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`h-5 w-5 rounded-full ${activity.type === 'payment' ? 'bg-orange-100 dark:bg-primary/20' : 'bg-blue-100'} flex items-center justify-center`}>
                      {activity.type === 'payment' ? (
                        <Check className="h-3 w-3 text-orange-600 dark:text-primary/90" />
                      ) : (
                        <RefreshCw className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">{activity.clientName}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date ? new Date(activity.date).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}
