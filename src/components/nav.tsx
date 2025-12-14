
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Settings,
  Dumbbell
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
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
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
           <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-8 w-8 text-primary"
              fill="currentColor"
            >
              <path d="M16.14,3.86,12,8,7.86,3.86a2,2,0,0,0-2.83,0h0a2,2,0,0,0,0,2.83L9.17,11,5,15.14a2,2,0,0,0,0,2.83h0a2,2,0,0,0,2.83,0L12,14l4.14,4.14a2,2,0,0,0,2.83,0h0a2,2,0,0,0,0-2.83L14.83,11,19,6.86a2,2,0,0,0,0-2.83h0A2,2,0,0,0,16.14,3.86Z" />
            </svg>
          <h1 className="text-xl font-bold font-headline text-foreground">
            FitManager
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
                    <p className="font-semibold text-sm">{t.nav.coachSara}</p>
                    <p className="text-xs text-muted-foreground">{t.nav.proAccount}</p>
                </div>
            </div>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
