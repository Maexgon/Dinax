
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

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait until auth state is determined
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    if (user) {
      // User is logged in, check profile status
      setIsProfileLoading(true); // Start profile check
      const profileRef = doc(firebaseServices.firestore, `users`, user.uid);
      getDoc(profileRef).then(profileSnap => {
        const data = profileSnap.data();
        const profileRole = data?.role;
        const profileComplete = data?.isProfileComplete || false;
        const forceReset = data?.forcePasswordChange || false;
        
        setRole(profileRole || null);
        setIsProfileComplete(profileComplete);
        setForcePasswordChange(forceReset);
        setProfileData(data || null);

        const isClientPortal = pathname.startsWith('/clients/dashboard') || 
                               pathname.startsWith('/clients/profile') || 
                               pathname.startsWith('/clients/calendar');
        
        const isAdminRoute = pathname.startsWith('/admin');
        const isAuthRoute = pathname.startsWith('/auth');
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isAuthRoute;
        const isCoachRoute = !isClientPortal && !isPublicRoute && !isAdminRoute;

        // Force password change redirect
        if (forceReset && pathname !== '/auth/change-password' && !isPublicRoute) {
          router.push('/auth/change-password');
          return;
        }

        if (profileRole === 'admin') {
          // Admin Logic: Admins can access everything, but redirect from public routes
          if (isPublicRoute) {
            router.push('/admin');
          }
          // Admins are NOT restricted from coach or client routes
        } else if (profileRole === 'client') {
          // Client Logic: Redirect away from Coach or Admin routes
          if (isCoachRoute || isAdminRoute) {
            router.push('/clients/dashboard');
            return;
          }

          if (!profileComplete) {
            const CLIENT_ONBOARDING = '/clients/profile';
            if (pathname !== CLIENT_ONBOARDING) {
              router.push(CLIENT_ONBOARDING);
            }
          } else {
            if (isPublicRoute) {
              router.push('/clients/dashboard');
            }
          }
        } else {
          // Coach Logic: Redirect away from Client Portal or Admin routes
          if (isClientPortal || isAdminRoute) {
            router.push('/dashboard');
            return;
          }

          if (!profileComplete) {
            if (!isOnboardingRoute) {
              router.push(ONBOARDING_ROUTE);
            }
          } else {
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
      <UserProfileContext.Provider value={{ role, isProfileComplete, forcePasswordChange, profileData }}>
        {user && <AutoLogout />}
        {children}
      </UserProfileContext.Provider>
    </FirebaseProvider>
  );
}
