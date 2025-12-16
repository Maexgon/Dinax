
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

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
  const [isProfileLoading, setIsProfileLoading] = useState(true); // New state for profile check
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseServices.auth,
      (user) => {
        setUser(user);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, [firebaseServices.auth]);

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait until auth state is determined
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    if (user) {
      // User is logged in, check profile status
      setIsProfileLoading(true); // Start profile check
      const profileRef = doc(firebaseServices.firestore, `tenants/${user.uid}/user_profile`, user.uid);
      getDoc(profileRef).then(profileSnap => {
        const isProfileComplete = profileSnap.exists() && profileSnap.data().isProfileComplete;

        if (!isProfileComplete) {
          // Profile is incomplete, force redirect to onboarding
          if (!isOnboardingRoute) {
            router.push(ONBOARDING_ROUTE);
          }
        } else {
          // Profile is complete, if they are on a public route, redirect to dashboard
          if (isPublicRoute) {
            router.push('/dashboard');
          }
        }
      }).catch(error => {
        console.error("Error checking user profile, proceeding with default navigation.", error);
        // If there's an error, just redirect to dashboard if on a public route
        if (isPublicRoute) {
          router.push('/dashboard');
        }
      }).finally(() => {
        setIsProfileLoading(false); // Finish profile check
      });
    } else {
      // User is not logged in
      setIsProfileLoading(false); // No profile to load
      if (!isPublicRoute) {
        router.push('/login');
      }
    }
  }, [user, isAuthLoading, pathname, router, firebaseServices.firestore]);
  
  // Show a loader while we are determining auth state OR checking the profile.
  // This prevents brief flashes of content before redirection logic kicks in.
  const isLoading = isAuthLoading || (user && isProfileLoading && !PUBLIC_ROUTES.includes(pathname));

  if (isLoading) {
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
