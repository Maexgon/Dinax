
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { AutoLogout } from '@/components/auth/auto-logout';

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
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { auth } = firebaseServices;
    // Set persistence to session (clears when tab/window is closed)
    // Note: This must be done before other auth operations if possible, 
    // but doing it here ensures it applies.
    // We import specific functions to avoid loading all auth code if tree-shaking works,
    // but here we use the instance.
    import('firebase/auth').then(({ setPersistence, browserSessionPersistence }) => {
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          console.log("Auth persistence set to SESSION");
        })
        .catch((error) => {
          console.error("Error setting persistence:", error);
        });
    });

    const unsubscribe = onAuthStateChanged(
      auth,
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
      const profileRef = doc(firebaseServices.firestore, `user_profile`, user.uid);
      getDoc(profileRef).then(profileSnap => {
        const data = profileSnap.data();
        const isProfileComplete = data?.isProfileComplete;
        const role = data?.role;

        if (role === 'client') {
          // Client Logic
          if (!isProfileComplete) {
            // If client profile is incomplete, redirect to CLIENT onboarding
            // Assuming /clients/profile is the client onboarding equivalent
            const CLIENT_ONBOARDING = '/clients/profile';
            if (pathname !== CLIENT_ONBOARDING) {
              router.push(CLIENT_ONBOARDING);
            }
          } else {
            // If profile is complete and on public route, go to client dashboard
            if (isPublicRoute) {
              router.push('/clients/dashboard');
            }
          }
        } else {
          // Coach/Default Logic
          if (!isProfileComplete) {
            // Force redirect to coach onboarding
            if (!isOnboardingRoute) {
              router.push(ONBOARDING_ROUTE);
            }
          } else {
            // Profile is complete, if on public route, redirect to coach dashboard
            if (isPublicRoute) {
              router.push('/dashboard');
            }
          }
        }
      }).catch(error => {
        console.error("Error checking user profile, proceeding with default navigation.", error);
        // If error, try to guess based on context or just fallback to dashboard
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
      storage={firebaseServices.storage}
    >
      {user && <AutoLogout />}
      {children}
    </FirebaseProvider>
  );
}
