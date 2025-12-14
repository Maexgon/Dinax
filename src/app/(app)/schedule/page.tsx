
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

  const getStudentForEvent = (studentName: string) => {
    return mockStudents.find(s => s.name === studentName);
  }

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">{t.schedule.title}</h1>
            <p className="text-muted-foreground">{t.schedule.description}</p>
        </div>
        <Card>
          <CardContent className="p-2 md:p-4">
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
                  ).sort((a,b) => a.start.getTime() - b.start.getTime());

                  return (
                    <div className="relative h-full w-full p-1 flex flex-col gap-1 overflow-hidden">
                      <div className="absolute top-1 right-1 text-xs text-muted-foreground">{format(date, 'd')}</div>
                      <div className="flex flex-col gap-1 mt-5">
                      {dayEvents.map((event, index) => {
                        const student = getStudentForEvent(event.studentName);
                        return (
                        <div key={event.id} className={`p-1.5 rounded-md text-xs border-l-4 ${eventColors[index % eventColors.length]}`}>
                           <p className="font-semibold truncate">{event.title}</p>
                           <p className="text-[10px]">{format(event.start, 'HH:mm')}</p>
                            {student && (
                               <div className="flex items-center gap-1 mt-1">
                                    <Avatar className="h-4 w-4">
                                        <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.avatarHint}/>
                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] truncate">{student.name}</span>
                               </div>
                            )}
                        </div>
                      )})}
                      </div>
                    </div>
                  );
                },
              }}
               classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] justify-start text-left p-2",
                    row: "flex w-full mt-2",
                    cell: "h-32 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border border-border",
                    day: "h-full w-full p-1",
                    day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent/50 text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50 bg-muted/20",
                }}
            />
          </CardContent>
        </Card>
      </div>
  );
}
