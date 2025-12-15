'use server';

import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';

// This function can be defined here as it's only used server-side in this file.
// By initializing within the action, we ensure a clean, correct server-side context.
function initializeServerSideFirebase() {
  const apps = getApps();
  // Use a unique app name for the server-side instance to avoid conflicts with the client-side app.
  const appName = 'server-side-auth-app';
  if (!apps.some(app => app.name === appName)) {
    return initializeApp(firebaseConfig, appName);
  }
  return getApp(appName);
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
  // Initialize Firebase within the server action for authentication only
  const serverApp = initializeServerSideFirebase();
  const auth = getAuth(serverApp);
  const firestore = getFirestore(serverApp);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const tenantId = user.uid;

    const tenantRef = doc(firestore, 'tenants', tenantId);
    const userRef = doc(firestore, `tenants/${tenantId}/users`, user.uid);

    // CRITICAL: Await both Firestore writes to complete before returning success.
    // This ensures the security rules will find the necessary documents.
    await setDoc(tenantRef, {
        id: tenantId,
        name: `${firstName}'s Gym`,
        members: {
            [tenantId]: 'owner',
        },
        createdAt: serverTimestamp(),
    });

    await setDoc(userRef, {
        id: user.uid,
        tenantId: tenantId,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        createdAt: serverTimestamp(),
    });

    // Now it's safe to return success
    return {
      success: true,
      message: 'User account and profile created successfully.',
    };

  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use by another account.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
}
