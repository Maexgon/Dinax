'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Home,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  Settings,
  CircleUser,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const pathToBreadcrumb: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/plans': 'Training Plans',
  '/schedule': 'Schedule',
  '/payments': 'Payments & Services',
  '/ai-goals': 'AI Goal Setter',
};


export function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
       <SidebarTrigger className="shrink-0 md:hidden" />
      <div className="flex-1">
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
           <Link href="/dashboard" className="font-semibold text-foreground">
             <Dumbbell className="h-6 w-6" />
             <span className="sr-only">GymEdge</span>
           </Link>
          {pathSegments.map((segment, index) => {
             const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
             const name = pathToBreadcrumb[href] || segment.charAt(0).toUpperCase() + segment.slice(1);
             const isLast = index === pathSegments.length - 1;
             return (
               <React.Fragment key={href}>
                 <span>/</span>
                 <Link
                   href={href}
                   className={`${isLast ? 'text-foreground' : 'text-muted-foreground'}`}
                 >
                   {name}
                 </Link>
               </React.Fragment>
             );
           })}
        </nav>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
