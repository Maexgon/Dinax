'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, FileText, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientNav() {
    const pathname = usePathname();

    const navItems = [
        {
            href: '/clients/dashboard',
            icon: Home,
            label: 'Inicio',
        },
        {
            href: '/clients/calendar',
            icon: Calendar,
            label: 'Agenda',
        },
        {
            href: '/clients/plan',
            icon: FileText,
            label: 'Plan',
        },
        {
            href: '/clients/messages',
            icon: MessageSquare,
            label: 'Mensajes',
        },
        {
            href: '/clients/profile',
            icon: User,
            label: 'Perfil',
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Strict or prefix matching
                    const isActive = pathname === item.href || (item.href !== '/clients/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
