
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

async function setupInitialUserData(
  firestore: any,
  user: User
): Promise<void> {
  const tenantRef = doc(firestore, 'tenants', user.uid);
  const tenantSnap = await getDoc(tenantRef);

  // Only proceed if the tenant document does NOT exist
  if (!tenantSnap.exists()) {
    try {
      const batch = writeBatch(firestore);

      // 1. Tenant Document
      const tenantData = {
        id: user.uid,
        name: `${user.displayName || user.email}'s Gym`, // Default name
        members: { [user.uid]: 'owner' },
        createdAt: serverTimestamp(),
      };
      batch.set(tenantRef, tenantData);

      // 2. User Document (within the new tenant's subcollection)
      const userRef = doc(firestore, `tenants/${user.uid}/users`, user.uid);
      const userData = {
        id: user.uid,
        tenantId: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'New',
        lastName: user.displayName?.split(' ')[1] || 'User',
        email: user.email,
        joinDate: new Date().toISOString().split('T')[0],
        progress: 0,
        createdAt: serverTimestamp(),
      };
      batch.set(userRef, userData);

      // Commit the atomic batch
      await batch.commit();
    } catch (error) {
      console.error('Failed to create initial user data:', error);
      // Optional: Add user-facing error handling here
      throw error; // Re-throw to be caught by caller if needed
    }
  }
}

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
        if (user) {
          // The logic for initial data setup is now handled client-side during registration.
          // This provider's role is now simplified to just managing auth state and routing.
          setUser(user);
        } else {
          setUser(null);
        }
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseServices]);

  useEffect(() => {
    if (isAuthLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) =>
        pathname === route || (route !== '/' && pathname.startsWith(route))
    );
    const isAppRoute = !isPublicRoute && pathname !== '/client/dashboard'; // Exclude client dashboard

    // If user is logged in and tries to access a public route, redirect to app dashboard
    if (user && isPublicRoute) {
      router.push('/dashboard');
    } 
    // If user is not logged in and tries to access a protected app route, redirect to login
    else if (!user && isAppRoute) {
      router.push('/login');
    }
  }, [user, isAuthLoading, pathname, router]);

  const isProtectedRoute = !PUBLIC_ROUTES.some(
    (route) =>
      pathname === route || (route !== '/' && pathname.startsWith(route))
  );

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
