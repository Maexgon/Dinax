
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Settings,
  Dumbbell,
  Bot
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useLanguage } from '@/context/language-context';

const coachAvatar = PlaceHolderImages.find(p => p.id === 'student-1');

export function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { href: '/students', icon: Users, label: t.nav.students },
    { href: '/schedule', icon: Calendar, label: t.nav.schedule },
    { href: '/payments', icon: Wallet, label: t.nav.finances },
    { href: '/plans', icon: Dumbbell, label: t.plans.title },
    { href: '/ai-goals', icon: Bot, label: t.aiGoals.title },
  ];

  return (
    <Sidebar>
      <SidebarRail />
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={32} height={32} data-ai-hint="logo" />
          <h1 className="text-xl font-bold font-headline text-sidebar-foreground">
            Dinax
          </h1>
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
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild tooltip={t.nav.settings}>
                <Link href="#">
                  <Settings />
                  <span>{t.nav.settings}</span>
                </Link>
              </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={coachAvatar?.imageUrl} alt={t.nav.coachSara} data-ai-hint={coachAvatar?.imageHint} />
                    <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm text-sidebar-foreground">{t.nav.coachSara}</p>
                    <p className="text-xs text-sidebar-foreground/80">{t.nav.proAccount}</p>
                </div>
            </div>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
