
'use client';

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, Legend } from 'recharts';
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
import { bodyCompositionData } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

const chartConfig = {
  fatPercentage: {
    label: '% Grasa',
    color: 'hsl(var(--chart-1))',
  },
  muscleMass: {
    label: 'Masa Muscular',
    color: 'hsl(var(--chart-2))',
  },
};

export function BodyCompositionChart() {
  const { t } = useLanguage();
  chartConfig.fatPercentage.label = t.clientDetail.fatPercentage;
  chartConfig.muscleMass.label = t.clientDetail.muscleMassKg;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.clientDetail.bodyComposition}</CardTitle>
        <CardDescription>{t.clientDetail.bodyCompositionDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={bodyCompositionData}
            margin={{
              left: -20,
              right: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
             <Legend />
            <Line
              dataKey="fatPercentage"
              type="natural"
              stroke="var(--color-fatPercentage)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              dataKey="muscleMass"
              type="natural"
              stroke="var(--color-muscleMass)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
