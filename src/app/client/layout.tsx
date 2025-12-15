
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ClientNav } from './client-nav';
import { ClientHeader } from './client-header';
import { LanguageProvider } from '@/context/language-context';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <ClientNav />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <ClientHeader />
            <main className="flex-1 p-4 sm:p-6 bg-muted/40">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LanguageProvider>
  );
}
