
'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  isPast,
  isFuture,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Plus,
  CalendarDays,
  Columns,
  Square,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { CalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const eventColors = [
  'bg-blue-100 border-l-4 border-blue-500 text-blue-800',
  'bg-orange-100 border-l-4 border-orange-500 text-orange-800',
  'bg-purple-100 border-l-4 border-purple-500 text-purple-800',
  'bg-green-100 border-l-4 border-green-500 text-green-800',
  'bg-red-100 border-l-4 border-red-500 text-red-800',
];

const DayView = ({ events, currentDate, t, isLoading }: { events: CalendarEvent[], currentDate: Date, t: any, isLoading: boolean }) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM
  const router = useRouter();

  const dayEvents = useMemo(() => events?.filter(event => {
    const eventDate = (event.start as Timestamp).toDate();
    return format(eventDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
  }).sort((a, b) => (a.start as Timestamp).toDate().getTime() - (b.start as Timestamp).toDate().getTime()) || [], [events, currentDate]);

  return (
    <Card className="flex-1">
      <CardContent className="p-0 h-full">
        <div className="relative h-full">
          {hours.map(hour => (
            <div key={hour} className="flex h-20 border-b last:border-b-0">
              <div className="w-20 text-center text-sm text-muted-foreground pt-2 border-r">
                {format(new Date(0, 0, 0, hour), 'p', { locale: t.lang === 'es' ? es : undefined })}
              </div>
              <div className="flex-1"></div>
            </div>
          ))}
          {isLoading ? <Skeleton className="absolute inset-0" /> : dayEvents.map((event, index) => {
            const start = (event.start as Timestamp).toDate();
            const end = (event.end as Timestamp).toDate();
            const top = (start.getHours() - 7 + start.getMinutes() / 60) * 80;
            const height = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 80 - 2;

            return (
              <Link href={`/schedule/${event.id}/edit`} key={event.id} style={{ top: `${top}px`, height: `${height}px` }} className={cn("absolute left-24 right-4 p-2 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-opacity", eventColors[index % eventColors.length])}>
                <p className="font-semibold truncate">{event.title}</p>
                <p>{format(start, 'p')} - {format(end, 'p')}</p>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const WeekView = ({ events, currentDate, t, isLoading }: { events: CalendarEvent[], currentDate: Date, t: any, isLoading: boolean }) => {
  const { language } = useLanguage();
  const weekStartsOn = language === 'es' ? 1 : 0;
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn }) });

  return (
    <Card className="flex-1">
      <CardContent className="p-0 h-full">
        <div className="grid grid-cols-7 h-full">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = events?.filter(event => {
              const eventDate = (event.start as Timestamp).toDate();
              return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
            }).sort((a, b) => (a.start as Timestamp).toDate().getTime() - (b.start as Timestamp).toDate().getTime()) || [];

            return (
              <div key={day.toString()} className={cn('border-t p-2 overflow-y-auto relative h-[70vh]', dayIndex < 6 ? 'border-r' : '')}>
                <div className="text-center mb-2">
                  <p className="text-xs text-muted-foreground">{format(day, 'EEE', { locale: language === 'es' ? es : undefined })}</p>
                  <span className={cn('font-semibold text-lg', isToday(day) && 'bg-primary text-primary-foreground rounded-full flex items-center justify-center h-8 w-8 mx-auto')}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-1">
                  {isLoading ? <Skeleton className="h-10 w-full" /> : dayEvents.map((event, eventIndex) => (
                    <Link href={`/schedule/${event.id}/edit`} key={event.id} className={cn('p-1.5 rounded-md text-[11px] block cursor-pointer hover:opacity-80 transition-opacity', eventColors[eventIndex % eventColors.length])}>
                      <p className="font-semibold truncate">{format((event.start as Timestamp).toDate(), 'HH:mm')} {event.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


const MonthView = ({ events, currentDate, t, isLoading }: { events: CalendarEvent[], currentDate: Date, t: any, isLoading: boolean }) => {
  const { language } = useLanguage();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);

  const startingDay = useMemo(() => {
    const day = getDay(monthStart);
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0
  }, [monthStart]);

  const weekdays = useMemo(
    () => language === 'es' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    [language]
  );

  return (
    <Card className="flex-1">
      <CardContent className="p-0 h-full">
        <div className="grid grid-cols-7 h-full">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-semibold py-2 border-b text-muted-foreground text-sm border-r last:border-r-0">
              {day}
            </div>
          ))}

          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="border-r border-t bg-muted/50"></div>
          ))}

          {daysInMonth.map((day, dayIndex) => {
            const dayEvents =
              events?.filter(
                (event) => {
                  const eventDate = (event.start as Timestamp).toDate();
                  return format(eventDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                }
              ).sort((a, b) => (a.start as Timestamp).toDate().getTime() - (b.start as Timestamp).toDate().getTime()) || [];

            return (
              <div
                key={day.toString()}
                className={cn(
                  'border-t p-2 h-40 overflow-y-auto relative',
                  (dayIndex + startingDay) % 7 === 6 ? '' : 'border-r'
                )}
              >
                <span
                  className={cn(
                    'font-semibold',
                    isToday(day)
                      ? 'bg-primary text-primary-foreground rounded-full flex items-center justify-center h-6 w-6'
                      : 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    dayEvents.map((event, eventIndex) => {
                      return (
                        <Link
                          href={`/schedule/${event.id}/edit`}
                          key={event.id}
                          className={cn(
                            'p-1.5 rounded-md text-[11px] block cursor-pointer hover:opacity-80 transition-opacity',
                            eventColors[eventIndex % eventColors.length]
                          )}
                        >
                          <p className="font-semibold truncate">
                            {format((event.start as Timestamp).toDate(), 'HH:mm')} {event.title}
                          </p>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

          {Array.from({
            length: 42 - daysInMonth.length - startingDay,
          }).map((_, index) => (
            <div
              key={`empty-end-${index}`}
              className={cn(
                'border-t bg-muted/50',
                (daysInMonth.length + startingDay + index) % 7 === 6
                  ? ''
                  : 'border-r'
              )}
            ></div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();

  const tenantId = user?.uid;

  const { monthStart, monthEnd } = useMemo(() => {
    return {
      monthStart: startOfMonth(currentDate),
      monthEnd: endOfMonth(currentDate)
    };
  }, [currentDate]);

  const eventsRef = useMemoFirebase(
    () =>
      firestore && tenantId
        ? query(
          collection(firestore, `tenants/${tenantId}/events`),
          where('start', '>=', monthStart),
          where('start', '<=', monthEnd)
        )
        : null,
    [firestore, tenantId, monthStart, monthEnd]
  );

  const { data: events, isLoading } = useCollection<CalendarEvent>(eventsRef);

  const stats = useMemo(() => {
    if (!events) return { sessionsToday: 0, completedToday: 0, pendingWeek: 0, completedMonth: 0, attendance: 0 };

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: language === 'es' ? 1 : 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: language === 'es' ? 1 : 0 });

    const sessionsTodayArr = events.filter(e => isToday((e.start as Timestamp).toDate()));
    const sessionsToday = sessionsTodayArr.length;
    const completedToday = sessionsTodayArr.filter(e => isPast((e.end as Timestamp).toDate())).length;

    const pendingWeek = events.filter(e => {
      const startDate = (e.start as Timestamp).toDate();
      return startDate >= weekStart && startDate <= weekEnd && isFuture(startDate);
    }).length;

    const completedMonth = events.filter(e => isPast((e.end as Timestamp).toDate())).length;
    const attendance = events.length > 0 ? Math.round((completedMonth / events.length) * 100) : 0;

    return { sessionsToday, completedToday, pendingWeek, completedMonth, attendance };
  }, [events, language]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const headerTitle = useMemo(() => {
    const locale = language === 'es' ? es : undefined;
    const weekOptions = { weekStartsOn: language === 'es' ? 1 : 0 };
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale });
    if (view === 'week') {
      const start = startOfWeek(currentDate, weekOptions);
      const end = endOfWeek(currentDate, weekOptions);
      return `${format(start, 'd MMM', { locale })} - ${format(end, 'd MMM yyyy', { locale })}`;
    }
    return format(currentDate, 'd MMMM yyyy', { locale });
  }, [currentDate, view, language]);

  const eventsForView = useMemo(() => {
    if (view === 'month' || !events) return events || [];

    const locale = { weekStartsOn: language === 'es' ? 1 : 0 };
    const rangeStart = view === 'week' ? startOfWeek(currentDate, locale) : new Date(currentDate.setHours(0, 0, 0, 0));
    const rangeEnd = view === 'week' ? endOfWeek(currentDate, locale) : new Date(currentDate.setHours(23, 59, 59, 999));

    return events.filter(event => {
      const eventDate = (event.start as Timestamp).toDate();
      return eventDate >= rangeStart && eventDate <= rangeEnd;
    });

  }, [events, view, currentDate, language]);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            {t.schedule.title}
          </h1>
          <p className="text-muted-foreground">{t.schedule.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'month' ? 'default' : 'ghost'} onClick={() => setView('month')}>
            <CalendarDays className="mr-2 h-4 w-4" />{t.schedule.month}
          </Button>
          <Button variant={view === 'week' ? 'default' : 'ghost'} onClick={() => setView('week')}>
            <Columns className="mr-2 h-4 w-4" />{t.schedule.week}
          </Button>
          <Button variant={view === 'day' ? 'default' : 'ghost'} onClick={() => setView('day')}>
            <Square className="mr-2 h-4 w-4" />{t.schedule.day}
          </Button>
          <Button asChild>
            <Link href="/schedule/new">
              <Plus className="mr-2 h-4 w-4" /> {t.schedule.newSession}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-muted-foreground">{t.schedule.sessionsToday}</p>
              {isLoading ? <Skeleton className="h-8 w-24" /> :
                <p className="text-2xl font-bold">
                  {stats.completedToday} <span className="text-base font-normal text-muted-foreground">de {stats.sessionsToday} {t.schedule.scheduled}</span>
                </p>
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-muted-foreground">{t.schedule.pendingWeek}</p>
              {isLoading ? <Skeleton className="h-8 w-16" /> :
                <p className="text-2xl font-bold">
                  {stats.pendingWeek} <span className="text-sm text-primary/80">{t.schedule.sessions.toLowerCase()}</span>
                </p>
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-muted-foreground">{t.schedule.completedMonth}</p>
              {isLoading ? <Skeleton className="h-8 w-20" /> :
                <p className="text-2xl font-bold">
                  {stats.completedMonth} <span className="text-sm text-green-600">{stats.attendance}% {t.schedule.attendance}</span>
                </p>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold capitalize w-48 text-center">
              {headerTitle}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleToday}>
            {t.schedule.today}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Todos
          </Button>
          <Button variant="ghost" size="sm" className="text-orange-500">
            Fuerza
          </Button>
          <Button variant="ghost" size="sm" className="text-blue-500">
            Cardio
          </Button>
          <Button variant="ghost" size="sm" className="text-purple-500">
            HIIT
          </Button>
        </div>
      </div>

      {view === 'month' && <MonthView events={eventsForView} currentDate={currentDate} t={t} isLoading={isLoading} />}
      {view === 'week' && <WeekView events={eventsForView} currentDate={currentDate} t={t} isLoading={isLoading} />}
      {view === 'day' && <DayView events={eventsForView} currentDate={currentDate} t={t} isLoading={isLoading} />}

    </div>
  );
}
