
'use client';
import {
  ArrowRight,
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  Flame,
  LineChart,
  User,
  Weight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/language-context';
import Image from 'next/image';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from 'recharts';
import Link from 'next/link';

const chartData = [
  { name: 'Sem 1', value: 1800 },
  { name: 'Sem 2', value: 2000 },
  { name: 'Sem 3', value: 1900 },
  { name: 'Sem 4', value: 2200 },
  { name: 'Sem 5', value: 2300 },
  { name: 'Sem 6', value: 2500 },
  { name: 'Actual', value: 2600 },
];

const chartConfig = {
  value: {
    label: 'Kg',
    color: 'hsl(var(--chart-1))',
  },
};

const weeklySchedule = [
    { day: 'HOY', date: 12, title: 'Entrenamiento Pectoral', time: '18:00 - 19:30', current: true },
    { day: 'MIE', date: 13, title: 'Descanso Activo', description: 'Caminata o estiramientos' },
    { day: 'JUE', date: 14, title: 'Revisión con Entrenador', time: '10:00 AM (Zoom)' },
]

export default function ClientDashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">{t.clientDashboard.greeting}</h1>
          <p className="text-muted-foreground">{t.clientDashboard.motivation}</p>
        </div>
        <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700">
            <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          {t.clientDashboard.activePlan}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.clientDashboard.currentWeight}</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72.5 kg</div>
            <p className="text-xs text-destructive/80">-1.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.clientDashboard.bodyFat}</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14%</div>
            <p className="text-xs text-destructive/80">-0.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.clientDashboard.sessions}</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">{t.clientDashboard.thisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.clientDashboard.streak}</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 {t.clientDashboard.days}</div>
            <p className="text-xs text-primary/80">+1 {t.clientDashboard.today}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <Image
                        src="https://i.ibb.co/yFR9LGPD/dinax.png"
                        alt="Dinax Logo"
                        width={300}
                        height={300}
                        className="rounded-lg object-contain w-full h-full p-4 bg-muted/20"
                        data-ai-hint="logo"
                    />
                </div>
                <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{t.clientDashboard.phase2}</Badge>
                    <h2 className="text-2xl font-bold font-headline mb-2">{t.clientDashboard.planTitle}</h2>
                    <p className="text-muted-foreground mb-4">{t.clientDashboard.planDescription}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>{t.clientDashboard.phaseProgress}</span>
                        <span className="font-semibold text-primary">65%</span>
                    </div>
                    <Progress value={65} className="h-2 mb-6"/>
                    <Button size="lg" className="w-full">
                        {t.clientDashboard.goToRoutine} <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                    <div className="flex justify-between text-sm mt-4 text-muted-foreground">
                        <span><Clock className="inline h-4 w-4 mr-1"/>60 min prom.</span>
                        <span><Calendar className="inline h-4 w-4 mr-1"/>4 días / semana</span>
                    </div>
                </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>{t.clientDashboard.performanceEvolution}</CardTitle>
              <CardDescription>{t.clientDashboard.performanceDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <RechartsBarChart accessibilityLayer data={chartData}>
                        <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis hide/>
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={8} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.clientDashboard.weeklyAgenda}</CardTitle>
              <Link href="#" className="text-sm font-medium text-primary hover:underline">{t.clientDashboard.viewAll}</Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {weeklySchedule.map((item) => (
                    <div key={item.date} className={`flex items-start gap-4 p-3 rounded-lg ${item.current ? 'bg-primary/10 border-l-4 border-primary' : 'bg-muted/50'}`}>
                        <div className="text-center w-10">
                            <p className="text-xs text-muted-foreground">{item.day}</p>
                            <p className="text-xl font-bold">{item.date}</p>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.time || item.description}</p>
                        </div>
                    </div>
                ))}
              <Button variant="outline" className="w-full">{t.clientDashboard.scheduleNewSession}</Button>
            </CardContent>
          </Card>
           <Card className="bg-gradient-to-br from-card to-secondary/50 dark:from-card dark:to-secondary/20">
                <CardHeader>
                    <CardTitle>{t.clientDashboard.premiumMembership}</CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">ACTIVA</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="flex items-center gap-2 text-sm">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <span>{t.clientDashboard.personalizedPlan}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <span>{t.clientDashboard.basicNutrition}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm">
                       <CheckCircle className="h-4 w-4 text-green-500" />
                       <span>{t.clientDashboard.chat247}</span>
                   </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                        <p>{t.clientDashboard.renewsOn}</p>
                        <p className="font-semibold text-foreground">25 Oct 2023</p>
                    </div>
                    <Button variant="ghost">{t.clientDashboard.manage}</Button>
                </CardFooter>
           </Card>
        </div>
      </div>
    </div>
  );
}
