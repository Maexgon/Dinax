'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, useUser } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthGate({ children }: { children: ReactNode }) {
    const { isUserLoading, user } = useUser();
  
    if (isUserLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
  
    return <>{children}</>;
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
        <AuthGate>
            {children}
        </AuthGate>
    </FirebaseProvider>
  );
}
