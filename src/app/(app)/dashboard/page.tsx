'use client';
import Link from 'next/link';
import {
  Users,
  Dumbbell,
  Wallet,
  Landmark,
  ArrowRight,
  Play,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import { mockStudents } from '@/lib/data';

const paymentData = [
    { name: 'Pagado', value: 2450, color: 'hsl(var(--chart-1))' },
    { name: 'Pendiente', value: 450, color: 'hsl(var(--accent))' },
];


export default function Dashboard() {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(today);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline">Hola, Coach Sara! 👋</h1>
            <p className="text-muted-foreground">Aquí tienes el resumen de tu día. ¡A por todas!</p>
          </div>
          <span className="text-sm text-muted-foreground capitalize">{formattedDate}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alumnos Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-600">
              +2 Nuevos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entrenamientos Hoy
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 <span className="text-base text-muted-foreground">/ 6 Sesiones</span></div>
             <Progress value={(4/6) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos este Mes</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.450€</div>
            <p className="text-xs text-green-600">
              +12%
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-300 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-orange-600">
              Acción Req.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Próximas Sesiones</CardTitle>
            <Link href="/schedule" className="text-sm font-medium text-primary hover:underline">
                Ver Agenda Completa
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground w-20">09:00 - 10:00</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1692197174597-1d85555c9b33?w=200" alt="Laura G." data-ai-hint="female athlete"/>
                            <AvatarFallback>LG</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Laura G.</p>
                            <p className="text-sm text-muted-foreground">Pierna & Glúteo</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">Completado</Badge>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary">
                <div className="text-xs text-muted-foreground w-20">10:30 - 11:30</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1662013606299-b8ff0a34efc0?w=200" alt="Carlos M." data-ai-hint="male athlete"/>
                            <AvatarFallback>CM</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Carlos M.</p>
                            <p className="text-sm text-muted-foreground">HIIT Intenso</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Badge variant="secondary" className="bg-green-100 text-green-700">En curso</Badge>
                        <Button variant="ghost" size="icon" className="rounded-full bg-primary h-8 w-8 text-primary-foreground">
                            <Play className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
             </div>
             <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground w-20">12:00 - 13:00</div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://images.unsplash.com/photo-1758599880453-ba4b22553606?w=200" alt="Ana R." data-ai-hint="person yoga" />
                            <AvatarFallback>AR</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">Ana R.</p>
                            <p className="text-sm text-muted-foreground">Yoga & Flexibilidad</p>
                        </div>
                    </div>
                    <Badge variant="outline">Próximo</Badge>
                </div>
             </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Estado de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full flex justify-center items-center relative h-40">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={450}>
                                {paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color}/>
                                ))}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute text-center">
                            <p className="text-3xl font-bold">85%</p>
                            <p className="text-sm text-muted-foreground">Cobrado</p>
                         </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary"></span>
                                <span>Pagado</span>
                            </div>
                            <span>2.450€</span>
                        </div>
                         <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-accent"></span>
                                <span>Pendiente</span>
                            </div>
                            <span>450€</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">Gestionar Facturas</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                         <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <p className="text-sm">
                            <span className="font-semibold">Sofia</span> completó su rutina de "Full Body" <br/>
                            <span className="text-xs text-muted-foreground">Hace 15 min</span>
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <RefreshCw className="h-3 w-3 text-blue-600" />
                        </div>
                        <p className="text-sm">
                            <span className="font-semibold">Marc</span> registró su peso: 78.5kg <br/>
                            <span className="text-xs text-muted-foreground">Hace 1 hora</span>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
