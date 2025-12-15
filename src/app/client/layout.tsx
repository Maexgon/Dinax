
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Dumbbell,
  LineChart,
  User,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/client/dashboard', icon: Home, label: 'Inicio' },
  { href: '/client/agenda', icon: Calendar, label: 'Mi Agenda' },
  { href: '/client/training', icon: Dumbbell, label: 'Entrenamiento' },
  { href: '/client/evolution', icon: LineChart, label: 'Evolución' },
  { href: '/client/profile', icon: User, label: 'Mi Perfil' },
];

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        <div className="p-6 flex items-center gap-3">
          <Image
            src="https://i.ibb.co/yFR9LGPD/dinax.png"
            alt="Dinax Logo"
            width={40}
            height={40}
            className="rounded-lg"
            data-ai-hint="logo"
          />
          <div>
            <p className="font-bold text-lg font-headline">Dinax</p>
            <p className="text-sm text-muted-foreground">Alex Morgan</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                pathname === item.href
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}


export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
        <ClientLayoutContent>{children}</ClientLayoutContent>
    </LanguageProvider>
  );
}
