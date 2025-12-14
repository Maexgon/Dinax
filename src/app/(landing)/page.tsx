'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, PlayCircle, ChevronDown,LayoutPanelLeft, Activity, CalendarCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const features = [
  {
    icon: <LayoutPanelLeft className="h-8 w-8 text-primary" />,
    title: 'Panel de Control',
    description:
      'Visualiza métricas clave, próximas sesiones y estado de alumnos en un dashboard intuitivo y personalizable.',
  },
  {
    icon: <Activity className="h-8 w-8 text-primary" />,
    title: 'Seguimiento en Vivo',
    description:
      'Registra progresos, sube videos de técnica y recibe feedback instantáneo de tu entrenador.',
  },
  {
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
    title: 'Planificación Flexible',
    description:
      'Crea rutinas complejas, asigna días de descanso y ajusta cargas de trabajo con nuestro calendario inteligente.',
  },
];

export default function LandingPage() {
  return (
    <div className="dark">
      <section className="relative h-[calc(100vh-56px)] w-full">
        <Image
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
          alt="Athlete training in a park"
          fill
          className="object-cover"
          data-ai-hint="athlete training park"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary-foreground border border-primary/20">
            GESTIÓN INTEGRAL DEPORTIVA
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl font-headline">
            Potencia tu <span className="text-primary">Rendimiento</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
            La plataforma definitiva para entrenadores personales y alumnos. Gestiona planes, sigue el progreso y alcanza metas con Dinax.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/dashboard">
                        Comenzar Ahora
                        <Rocket className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                    Ver Demo
                    <PlayCircle className="ml-2 h-5 w-5" />
                </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2 overflow-hidden">
                    <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                        <AvatarImage src="https://picsum.photos/seed/avatar1/32/32" data-ai-hint="person face"/>
                        <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                     <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                        <AvatarImage src="https://picsum.photos/seed/avatar2/32/32" data-ai-hint="person face"/>
                        <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                        <AvatarFallback>+2k</AvatarFallback>
                    </Avatar>
                </div>
                <div className="text-left">
                    <p className="text-sm font-semibold">Entrenadores activos</p>
                     <div className="flex items-center gap-0.5">
                        <span className="text-primary">★★★★★</span>
                    </div>
                </div>
            </div>
             <div className="absolute bottom-8 animate-bounce">
                <ChevronDown className="h-8 w-8" />
            </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl font-headline">
            Todo lo que necesitas para triunfar
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Diseñado específicamente para optimizar la relación entre coach y atleta con herramientas profesionales.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="text-left bg-card hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
