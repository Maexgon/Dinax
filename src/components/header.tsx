'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, PlusCircle, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="shrink-0 md:hidden" />
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar alumnos, rutinas..."
            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
    </header>
  );
}
