
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/'];
// Routes that are part of the initial onboarding and should be accessible right after login/register
const ONBOARDING_ROUTES = ['/profile'];

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const { toast } = useToast();
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseServices.auth,
      async (user) => {
        setUser(user);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseServices]);

  useEffect(() => {
    if (isAuthLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboardingRoute = ONBOARDING_ROUTES.includes(pathname);
    
    // If user is logged in...
    if (user) {
        // ...and they are on a public route (like /login), redirect to dashboard.
        if (isPublicRoute) {
            router.push('/dashboard');
        }
    } 
    // If user is NOT logged in...
    else {
        // ...and they try to access a protected route (not public and not onboarding), redirect to login.
        if (!isPublicRoute && !isOnboardingRoute) {
            router.push('/login');
        }
    }
  }, [user, isAuthLoading, pathname, router]);

  const isProtectedRoute = !PUBLIC_ROUTES.includes(pathname) && !ONBOARDING_ROUTES.includes(pathname);

  if (isAuthLoading && isProtectedRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
