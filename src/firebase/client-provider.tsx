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
    if (isAuthLoading) return; // Don't do anything while loading

    const isProtectedRoute = !PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (!user && isProtectedRoute) {
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // If we are still loading the auth state AND it's a protected route, show a spinner.
  // This is the main gate that prevents premature rendering of protected content.
  if (isAuthLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the route is public, or we have finished loading and have a user, render the children.
  // The redirection logic in the useEffect above handles the case where there's no user for a protected route.
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

  // This will be shown for a protected route if there's no user, right before redirection.
  // This also acts as a fallback loading screen.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
