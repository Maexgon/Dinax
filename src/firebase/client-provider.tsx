'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/'];

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseServices.auth, (user) => {
      setUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseServices.auth]);

  useEffect(() => {
    if (isAuthLoading) return; // Wait until auth state is resolved

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    
    if (!user && !isPublicRoute) {
      // If user is not logged in and tries to access a protected route, redirect to login
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register')) {
      // If user is logged in and tries to access login/register, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Show a global loader while we check for auth status on protected routes
  if (isAuthLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the route is public, or the user is authenticated, show the content.
  // The useEffect hook above will handle redirection if needed.
  if (isPublicRoute || user) {
      return (
        <FirebaseProvider
          firebaseApp={firebaseServices.firebaseApp}
          auth={firebaseServices.auth}
          firestore={firebaseServices.firestore}
        >
          {children}
        </FirebaseProvider>
      );
  }

  // This will be shown briefly for protected routes before redirection happens
  return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
  );
}
