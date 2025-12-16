
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
// The profile page is where users complete onboarding
const ONBOARDING_ROUTE = '/profile';

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileChecked, setIsProfileChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseServices.auth,
      async (user) => {
        setUser(user);
        setIsAuthLoading(false);
        // After auth state is known, reset profile check
        setIsProfileChecked(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseServices]);

  useEffect(() => {
    if (isAuthLoading) return; // Wait until auth state is resolved

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    // If user is logged in
    if (user) {
      // If we haven't checked the profile yet
      if (!isProfileChecked) {
        const checkProfile = async () => {
          try {
            const userProfileRef = doc(firebaseServices.firestore, `tenants/${user.uid}/user_profile`, user.uid);
            const userProfileSnap = await getDoc(userProfileRef);

            if (userProfileSnap.exists() && userProfileSnap.data().isProfileComplete === false) {
              // If profile is incomplete and we are NOT on the onboarding page, redirect there.
              if (!isOnboardingRoute) {
                router.push(ONBOARDING_ROUTE);
              }
            } else if (isPublicRoute) {
              // If profile is complete (or doesn't exist, which is a fallback) and user is on a public page, go to dashboard.
              router.push('/dashboard');
            }
          } catch (error) {
            console.error("Error checking user profile:", error);
            // Fallback: If there's an error, just go to the dashboard if on a public route.
             if (isPublicRoute) {
                router.push('/dashboard');
            }
          } finally {
            // Mark profile as checked to prevent redirect loops
            setIsProfileChecked(true);
          }
        };

        checkProfile();
        return; // Exit effect after starting profile check
      }
       // If profile is already checked, and user lands on a public route, redirect to dashboard
      if (isProfileChecked && isPublicRoute) {
        router.push('/dashboard');
      }
    }
    // If user is NOT logged in
    else {
      // And tries to access a protected route, redirect to login.
      if (!isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, isAuthLoading, pathname, router, isProfileChecked, firebaseServices.firestore]);

  // Show a loader while we are determining auth state and profile status on protected routes.
  const isLoadingScreen = (isAuthLoading || (user && !isProfileChecked)) && !PUBLIC_ROUTES.includes(pathname);

  if (isLoadingScreen) {
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
