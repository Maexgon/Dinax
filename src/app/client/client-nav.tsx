
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


export function ClientNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { state } = useSidebar();
  
  const navItems = [
    { href: '/client/dashboard', icon: Home, label: t.clientNav.home },
    { href: '/client/agenda', icon: Calendar, label: t.clientNav.agenda },
    { href: '/client/training', icon: Dumbbell, label: t.clientNav.training },
    { href: '/client/evolution', icon: LineChart, label: t.clientNav.evolution },
    { href: '/client/profile', icon: User, label: t.clientNav.profile },
  ];

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
            <SidebarMenuButton asChild tooltip={t.clientNav.logout}>
                <Link href="/">
                    <LogOut />
                    <span className={cn(
                      'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                    )}>
                        {t.clientNav.logout}
                    </span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
