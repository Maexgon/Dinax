'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, CreditCard, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        {
            href: '/clients/dashboard',
            icon: Home,
            label: 'Inicio', // TODO: Add to dictionary
        },
        {
            href: '/clients/calendar',
            icon: Calendar,
            label: 'Agenda',
        },
        {
            href: '/clients/messages',
            icon: MessageSquare,
            label: 'Mensajes',
        },
        {
            href: '/clients/payments',
            icon: CreditCard,
            label: 'Pagos',
        },
        {
            href: '/clients/profile',
            icon: User,
            label: 'Perfil',
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Main Content Area - Padding for top header if needed, and bottom nav */}
            <main className="flex-1 pb-20 md:pb-0 md:pl-64 transition-all duration-300">
                {/* Desktop Sidebar Placeholder (if we want hybrid) - For now Mobile First */}
                <div className="md:hidden">
                    {children}
                </div>

                {/* Desktop View Wrapper - showing same content but handling layout different if needed */}
                <div className="hidden md:block p-6">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t md:hidden">
                <nav className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                                    isActive
                                        ? "text-primary transition-colors"
                                        : "text-muted-foreground hover:text-primary/70 transition-colors"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop Navigation - Simple Sidebar for now if accessed on desktop */}
            <div className="hidden md:flex fixed top-0 bottom-0 left-0 w-64 border-r bg-card flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold font-headline text-primary">Dinax Client</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    );
}
