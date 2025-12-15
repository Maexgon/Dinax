
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
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/client/dashboard', icon: Home, label: 'Inicio' },
  { href: '/client/agenda', icon: Calendar, label: 'Mi Agenda' },
  { href: '/client/training', icon: Dumbbell, label: 'Entrenamiento' },
  { href: '/client/evolution', icon: LineChart, label: 'Evolución' },
  { href: '/client/profile', icon: User, label: 'Mi Perfil' },
];

export function ClientNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className={cn("flex items-center gap-2", state === 'collapsed' && 'justify-center')}>
          <Image
            src="https://i.ibb.co/yFR9LGPD/dinax.png"
            alt="Dinax Logo"
            width={40}
            height={40}
            className="rounded-lg"
            data-ai-hint="logo"
          />
          <div
            className={cn(
              'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
            )}
          >
            <p className="font-bold text-lg font-headline">Dinax</p>
            <p className="text-sm text-muted-foreground">Alex Morgan</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                >
                    <Link href={item.href}>
                        <item.icon />
                        <span className={cn(
                          'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                        )}>
                            {item.label}
                        </span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cerrar Sesión">
                <Link href="/">
                    <LogOut />
                    <span className={cn(
                      'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                    )}>
                        Cerrar Sesión
                    </span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
