'use server';

import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This function can be defined here as it's only used server-side in this file.
// By initializing within the action, we ensure a clean, correct server-side context.
function initializeServerSideFirebase() {
  const apps = getApps();
  if (!apps.length) {
    return initializeApp(firebaseConfig, 'server-side-app');
  }
  return getApp('server-side-app');
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
  // Initialize Firebase within the server action
  const serverApp = initializeServerSideFirebase();
  const auth = getAuth(serverApp);
  const firestore = getFirestore(serverApp);

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Use the user's UID as the tenantId for a simple 1-to-1 mapping
    const tenantId = user.uid;
    const tenantRef = doc(firestore, 'tenants', tenantId);
    
    // CRITICAL FIX: Ensure the 'members' map is included during tenant creation.
    // This map is what the security rules will check.
    await setDoc(tenantRef, {
      id: tenantId,
      name: `${firstName}'s Gym`,
      members: {
        [user.uid]: 'owner', // This user is the owner of their own tenant
      },
      createdAt: serverTimestamp(),
    });

    // Create the user profile within their own tenant
    const userRef = doc(firestore, `tenants/${tenantId}/users`, user.uid);
    await setDoc(userRef, {
      id: user.uid,
      tenantId: tenantId,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'User registered and tenant created successfully.',
      uid: user.uid,
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
