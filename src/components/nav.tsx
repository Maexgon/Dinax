
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  Settings,
  Dumbbell,
  Bot,
  LogOut,
  User,
  Package,
} from 'lucide-react';
import React from 'react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { state } = useSidebar();
  const { user, auth } = useFirebase();

  const navItems = React.useMemo(() => [
    { href: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { href: '/clients', icon: Users, label: t.nav.clients },
    { href: '/schedule', icon: Calendar, label: t.nav.schedule },
    { href: '/payments', icon: Wallet, label: t.nav.finances },
    { href: '/plans', icon: Dumbbell, label: t.plans.title },
    { href: '/services', icon: Package, label: t.nav.services },
    { href: '/ai-goals', icon: Bot, label: t.aiGoals.title },
  ], [t]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const userDisplayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const userInitials = (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();


  return (
    <Sidebar>
      <SidebarRail />
      <SidebarHeader className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2", state === 'collapsed' && 'justify-center')}>
          <Image src="https://i.ibb.co/yFR9LGPD/dinax.png" alt="Dinax Logo" width={50} height={50} data-ai-hint="logo" />
          <span
            className={cn(
              'text-xl font-bold font-headline',
              'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
            )}
          >
            Dinax
          </span>
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
                  <span
                    className={cn(
                      'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                    )}
                  >
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
            <SidebarMenuButton asChild tooltip={t.nav.settings} isActive={pathname.startsWith('/settings')}>
              <Link href="/settings">
                <Settings />
                <span className={cn(
                  'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                )}>
                  {t.nav.settings}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center w-full gap-3 p-2 rounded-md hover:bg-sidebar-accent", state === 'collapsed' && 'justify-center')}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL || ''} alt={userDisplayName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    'text-left',
                    'group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-all duration-200'
                  )}>
                    <p className="font-semibold text-sm text-sidebar-foreground truncate">{userDisplayName}</p>
                    <p className="text-xs text-sidebar-foreground/80">{t.nav.proAccount}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuLabel>{userDisplayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Editar Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
