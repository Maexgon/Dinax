'use server';

import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

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

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // IMPORTANT: The server action now ONLY creates the auth user.
    // It returns the necessary info for the client to create the Firestore documents.
    // This solves the race condition and context inconsistency issues.
    return {
      success: true,
      message: 'User account created successfully. Setting up profile...',
      uid: user.uid,
      email: user.email,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    };
  } catch (error: any) {
    // Return a more specific error message if available
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
