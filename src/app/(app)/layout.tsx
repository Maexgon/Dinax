import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Nav } from '@/components/nav';
import { Header } from '@/components/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Nav />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 sm:p-6 bg-background">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
