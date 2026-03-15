
'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { AutoLogout } from '@/components/auth/auto-logout';

interface UserProfileContextType {
  role: string | null;
  isProfileComplete: boolean;
  forcePasswordChange: boolean;
  profileData: any | null;
}

const UserProfileContext = React.createContext<UserProfileContextType>({
  role: null,
  isProfileComplete: false,
  forcePasswordChange: false,
  profileData: null,
});

export const useUserProfile = () => React.useContext(UserProfileContext);

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
  const [role, setRole] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
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

  // Fetch profile data only when user changes
  useEffect(() => {
    if (isAuthLoading || !user) {
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    const profileRef = doc(firebaseServices.firestore, `user_profile`, user.uid);
    getDoc(profileRef)
      .then((profileSnap) => {
        const data = profileSnap.data();
        setRole(data?.role || null);
        setIsProfileComplete(data?.isProfileComplete || false);
        setForcePasswordChange(data?.forcePasswordChange || false);
        setProfileData(data || null);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
      })
      .finally(() => {
        setIsProfileLoading(false);
      });
  }, [user, isAuthLoading, firebaseServices.firestore]);

  // Handle redirects when pathname, user, or profile data changes
  useEffect(() => {
    if (isAuthLoading || isProfileLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    if (!user) {
      if (!isPublicRoute) {
        router.push('/login');
      }
      return;
    }

    // Role-based redirection logic
    const isClientPortal = pathname.startsWith('/clients/dashboard') || 
                           pathname.startsWith('/clients/profile') || 
                           pathname.startsWith('/clients/calendar');

    const isAdminRoute = pathname.startsWith('/admin');
    const isAuthRoute = pathname.startsWith('/auth');
    const isCoachRoute = !isClientPortal && !isPublicRoute && !isAdminRoute && !isAuthRoute;

    if (forcePasswordChange) {
      if (pathname !== '/auth/change-password' && !isPublicRoute) {
        router.push('/auth/change-password');
        return;
      }
    }

    if (role === 'admin') {
      if (isPublicRoute) router.push('/admin');
    } else if (role === 'client') {
      if (isCoachRoute || isAdminRoute) {
        router.push('/clients/dashboard');
      } else if (isPublicRoute) {
        router.push('/clients/dashboard');
      }
    } else {
      // Coach
      if (isClientPortal || isAdminRoute) {
        router.push('/dashboard');
      } else if (!isProfileComplete && !isOnboardingRoute) {
        router.push(ONBOARDING_ROUTE);
      } else if (isPublicRoute) {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthLoading, isProfileLoading, pathname, router, role, isProfileComplete, forcePasswordChange]);

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
      <UserProfileContext.Provider value={{ role, isProfileComplete, forcePasswordChange, profileData }}>
        {user && <AutoLogout />}
        {children}
      </UserProfileContext.Provider>
    </FirebaseProvider>
  );
}
