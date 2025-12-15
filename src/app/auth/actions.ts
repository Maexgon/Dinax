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
import { randomUUID } from 'crypto';

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Helper to initialize and get SDKs on the server
function getAdminFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
  const { auth, firestore } = getAdminFirebase();
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

    // Create a new tenant for the user
    const tenantId = randomUUID();
    const tenantRef = doc(firestore, 'tenants', tenantId);
    await setDoc(tenantRef, {
      id: tenantId,
      name: `${firstName}'s Gym`, // Or some other default name
      members: {
        [user.uid]: 'owner',
      },
      createdAt: serverTimestamp(),
    });

    // Create the user profile within the tenant
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
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
}
