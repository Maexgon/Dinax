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
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import type { CalendarEvent } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const eventColors = [
  'bg-blue-100 border-l-4 border-blue-500 text-blue-800',
  'bg-orange-100 border-l-4 border-orange-500 text-orange-800',
  'bg-purple-100 border-l-4 border-purple-500 text-purple-800',
  'bg-green-100 border-l-4 border-green-500 text-green-800',
  'bg-red-100 border-l-4 border-red-500 text-red-800',
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { t, language } = useLanguage();
  const { firestore, user } = useFirebase();

  const tenantId = user?.uid;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

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

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startingDay = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1; // Adjust so Monday is 0

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekdays = useMemo(
    () =>
      language === 'es'
        ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    [language]
  );

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
          <Button variant="outline">{t.schedule.month}</Button>
          <Button variant="ghost">{t.schedule.week}</Button>
          <Button variant="ghost">{t.schedule.day}</Button>
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
              <p className="text-2xl font-bold">
                4 <span className="text-base font-normal text-muted-foreground">de 6 {t.schedule.scheduled}</span>
              </p>
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
              <p className="text-2xl font-bold">
                12 <span className="text-sm text-primary/80">{t.schedule.vsLastWeek}</span>
              </p>
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
              <p className="text-2xl font-bold">
                45 <span className="text-sm text-green-600">92% {t.schedule.attendance}</span>
              </p>
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
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold capitalize w-32 text-center">
              {format(currentDate, 'MMMM yyyy', {
                locale: language === 'es' ? es : undefined,
              })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
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

      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-7 h-full">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center font-semibold py-2 border-b text-muted-foreground text-sm border-r last:border-r-0"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: startingDay }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="border-r border-t bg-muted/50"
              ></div>
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
                          <div
                            key={event.id}
                            className={cn(
                              'p-1.5 rounded-md text-[11px]',
                              eventColors[eventIndex % eventColors.length]
                            )}
                          >
                            <p className="font-semibold truncate">
                              {format((event.start as Timestamp).toDate(), 'HH:mm')} {event.title}
                            </p>
                          </div>
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
    </div>
  );
}

    