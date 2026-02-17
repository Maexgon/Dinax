'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, PlayCircle, ChevronDown, LayoutPanelLeft, Activity, CalendarCheck, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';

export default function LandingPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <LayoutPanelLeft className="h-8 w-8 text-primary" />,
      title: t.landing.features.controlPanel.title,
      description: t.landing.features.controlPanel.description,
    },
    {
      icon: <Activity className="h-8 w-8 text-primary" />,
      title: t.landing.features.liveTracking.title,
      description: t.landing.features.liveTracking.description,
    },
    {
      icon: <CalendarCheck className="h-8 w-8 text-primary" />,
      title: t.landing.features.flexiblePlanning.title,
      description: t.landing.features.flexiblePlanning.description,
    },
  ];

  return (
    <div>
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
          <div className="mb-4 inline-block rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
            {t.landing.hero.tag}
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl font-headline"
            dangerouslySetInnerHTML={{ __html: t.landing.hero.title }}
          />
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {t.landing.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/login">
                {t.landing.hero.cta.start}
                <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/login">
                Soy Cliente
                <User className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-4">
            <Button variant="link" className="text-white/80 hover:text-white" asChild>
              <Link href="/register/client">
                ¿Tienes un código de invitación? Canjéalo aquí
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2 overflow-hidden">
              <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                <AvatarImage src="https://picsum.photos/seed/avatar1/32/32" data-ai-hint="person face" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                <AvatarImage src="https://picsum.photos/seed/avatar2/32/32" data-ai-hint="person face" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                <AvatarFallback>+2k</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{t.landing.hero.activeTrainers}</p>
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
            {t.landing.features.title}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t.landing.features.subtitle}
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
