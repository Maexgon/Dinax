
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { mockCalendarEvents } from '@/lib/data';
import { useLanguage } from '@/context/language-context';
import type { CalendarEvent } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockStudents } from '@/lib/data';

const eventColors = [
    'bg-blue-200/50 border-blue-500 text-blue-800',
    'bg-orange-200/50 border-orange-500 text-orange-800',
    'bg-purple-200/50 border-purple-500 text-purple-800',
    'bg-green-200/50 border-green-500 text-green-800',
];

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { t, language } = useLanguage();
  const today = new Date();
  const upcomingEvents = mockCalendarEvents
    .filter((event) => event.start >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const getStudentAvatar = (studentName: string) => {
    const student = mockStudents.find(s => s.name === studentName);
    return student?.avatarUrl || 'https://picsum.photos/seed/placeholder/32/32';
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="lg:col-span-3 md:col-span-2">
        <Card>
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md w-full"
              locale={language === 'es' ? es : undefined}
              components={{
                DayContent: ({ date, ...props }) => {
                  const dayEvents = mockCalendarEvents.filter(
                    (event) => format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  return (
                    <div className="relative h-full w-full p-2 flex flex-col gap-1">
                      <div className="absolute top-1 right-1 text-xs text-muted-foreground">{format(date, 'd')}</div>
                      {dayEvents.map((event, index) => (
                        <div key={event.id} className={`p-1 rounded-md text-xs border-l-4 ${eventColors[index % eventColors.length]}`}>
                           <p className="font-semibold truncate">{event.title}</p>
                           <p className="text-xs">{format(event.start, 'HH:mm')}</p>
                        </div>
                      ))}
                    </div>
                  );
                },
              }}
               classNames={{
                    head_cell:
                    "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                    cell: "h-24 w-24 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-full w-full p-2",
                    day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t.schedule.upcomingSessions}</CardTitle>
            <CardDescription>{t.schedule.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-shrink-0 text-center bg-background rounded-md px-2 py-1 w-16">
                      <p className="font-bold text-lg">{format(event.start, 'dd')}</p>
                      <p className="text-xs -mt-1 uppercase">{format(event.start, 'MMM', { locale: language === 'es' ? es : undefined })}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={getStudentAvatar(event.studentName)} alt={event.studentName} />
                            <AvatarFallback>{event.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{event.studentName}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t.schedule.noUpcomingSessions}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

