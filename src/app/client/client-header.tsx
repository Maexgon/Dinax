
'use client';

import React from 'react';
import { Bell, Languages, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLanguage } from '@/context/language-context';

export function ClientHeader() {
  const { t, setLanguage, language } = useLanguage();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <SidebarTrigger className="shrink-0 md:hidden" />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Languages className="h-5 w-5" />
              <span className="sr-only">{t.language}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')} disabled={language === 'es'}>
              Español
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
