'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Dumbbell, User, MessageSquare, CreditCard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';

export function ClientNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        { href: '/clients/dashboard', icon: Home, label: t.clientNav.home || 'Inicio' },
        { href: '/clients/calendar', icon: Calendar, label: t.clientNav.agenda || 'Agenda' },
        { href: '/clients/plan', icon: Dumbbell, label: t.clientNav.training || 'Entreno' },
        { href: '/clients/messages', icon: MessageSquare, label: 'Mensajes' }, // New
        { href: '/clients/profile', icon: User, label: t.clientNav.profile || 'Perfil' },
    ];

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href; // Exact match for bottom tab? Or startsWith?
                        // Usually exact match is better for bottom tabs, or startsWith for nested routes.
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full text-xs gap-1 transition-colors",
                                    active ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", active && "fill-current")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Sidebar Navigation (Hidden on mobile) */}
            <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 min-h-screen fixed left-0 top-0 bottom-0 z-40">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">D</div>
                    <span className="font-bold text-xl font-headline">Dinax</span>
                </div>
                <div className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                        <Link href="/api/auth/signout"> {/* Verify signout route */}
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}
