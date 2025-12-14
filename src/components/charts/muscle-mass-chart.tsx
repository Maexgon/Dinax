
'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { muscleMassData } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

const chartConfig = {
  muscle: {
    label: 'Masa Muscular',
    color: 'hsl(var(--chart-2))',
  },
};

export function MuscleMassChart() {
    const { t } = useLanguage();
    chartConfig.muscle.label = t.studentDetail.muscleMassKg;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.studentDetail.muscleMassEvolution}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={muscleMassData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis unit="kg" />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="muscle" fill="var(--color-muscle)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
