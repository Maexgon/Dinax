'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const today = new Date();
  const upcomingEvents = mockCalendarEvents
    .filter((event) => event.start >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              components={{
                DayContent: ({ date, ...props }) => {
                  const events = mockCalendarEvents.filter(
                    (event) => format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  return (
                    <div className="relative h-full w-full">
                      {props.children}
                      {events.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                           {events.slice(0, 3).map(event => (
                            <div key={event.id} className="h-1.5 w-1.5 rounded-full bg-accent" />
                           ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Sessions</CardTitle>
            <CardDescription>Your next scheduled appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-center bg-muted rounded-md px-2 py-1">
                      <p className="font-bold text-lg">{format(event.start, 'dd')}</p>
                      <p className="text-xs -mt-1">{format(event.start, 'MMM')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {event.studentName}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming sessions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
