
'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { progressData } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

const chartConfig = {
  'Bench Press': {
    label: 'Bench Press',
    color: 'hsl(var(--chart-1))',
  },
  'Squat': {
    label: 'Squat',
    color: 'hsl(var(--chart-2))',
  },
  'Deadlift': {
    label: 'Deadlift',
    color: 'hsl(var(--chart-3))',
  },
};

export function ProgressChart() {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.studentDetail.liftProgress}</CardTitle>
        <CardDescription>{t.studentDetail.liftProgressDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={progressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis unit="kg" />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="Bench Press" fill="var(--color-Bench Press)" radius={4} />
            <Bar dataKey="Squat" fill="var(--color-Squat)" radius={4} />
            <Bar dataKey="Deadlift" fill="var(--color-Deadlift)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {t.studentDetail.trendingUp} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {t.studentDetail.showingTotal}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
