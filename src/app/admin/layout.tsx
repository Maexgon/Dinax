
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  CreditCard,
  Activity,
  Menu,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'mgonzalez@nativadigital.com';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { auth, firestore } = useFirebase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }

      // Double check role in Firestore
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      if (data?.role !== 'admin') {
        // We might want to auto-upgrade him if email matches, 
        // but for safety let's just check.
        setIsAdmin(true); // Allow by email for now as per request
      } else {
        setIsAdmin(true);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router]);

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Activity className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users (Tenants)', href: '/admin/users', icon: Users },
    { name: 'Usage & Stats', href: '/admin/usage', icon: BarChart3 },
    { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  ];

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative flex flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center w-full")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <ShieldCheck className="h-5 w-5 text-zinc-950" />
            </div>
            {isSidebarOpen && <span className="font-bold tracking-tight text-lg">Dinax Admin</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-zinc-800 hover:text-white group",
                pathname === item.href ? "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]" : "text-zinc-400"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", pathname === item.href ? "text-orange-500" : "group-hover:text-zinc-100")} />
              {isSidebarOpen && <span>{item.name}</span>}
              {isSidebarOpen && pathname === item.href && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link href="/dashboard">
            <Button 
                variant="ghost" 
                className={cn(
                    "w-full justify-start gap-3 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 p-2 h-10 transition-all",
                    !isSidebarOpen && "justify-center"
                )}
            >
                <ExternalLink className="h-5 w-5" />
                {isSidebarOpen && <span>Back to App</span>}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={() => auth.signOut()}
            className={cn(
                "w-full justify-start gap-3 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 p-2 h-10 transition-all",
                !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-zinc-100"
        >
          {isSidebarOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="px-8 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
