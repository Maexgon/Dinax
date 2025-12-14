
'use client';

import { Target } from 'lucide-react';
import {
  PolarGrid,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { goalProgressData } from '@/lib/data';
import { useLanguage } from '@/context/language-context';

const chartConfig = {
  progress: {
    label: 'Progreso',
  },
};

export function GoalProgressChart() {
  const { t } = useLanguage();
  const progressValue = goalProgressData[0].progress;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t.studentDetail.goalProgressTitle}</CardTitle>
        <CardDescription>{t.studentDetail.goalProgressDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          <RadialBarChart
            data={goalProgressData}
            startAngle={90}
            endAngle={-270}
            innerRadius="70%"
            outerRadius="100%"
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="progress" background cornerRadius={10} />
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[60, 40]}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {t.studentDetail.goalProgressFooter.replace('{progress}', progressValue.toString())} <Target className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">{t.studentDetail.goalProgressFooterDescription}</div>
      </CardFooter>
    </Card>
  );
}
