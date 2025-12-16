'use server';

import admin from 'firebase-admin';
import { getFirestore, serverTimestamp, writeBatch } from 'firebase-admin/firestore';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase Admin SDK.
// It ensures that the app is initialized only once.
function initializeServerSideAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // IMPORTANT: For production, you must set the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable. In a local/dev environment, this will use the
  // credentials from gcloud auth application-default login.
  return admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
  const adminApp = initializeServerSideAdmin();
  const auth = admin.auth();
  const firestore = getFirestore(adminApp);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  try {
    // 1. Create the user in Firebase Authentication using Admin SDK.
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userRecord.uid;
    const tenantId = uid; // Use the user's UID as their tenant ID

    // 2. Set Custom Claim for tenantId. This is the key change.
    // This attaches the tenantId to the user's auth token.
    await auth.setCustomUserClaims(uid, { tenantId: tenantId });

    // 3. Create the tenant and user documents in Firestore using a batch write.
    const batch = firestore.batch();

    const tenantRef = firestore.collection('tenants').doc(tenantId);
    batch.set(tenantRef, {
      id: tenantId,
      name: `${firstName}'s Gym`,
      members: {
        [uid]: 'owner',
      },
      createdAt: serverTimestamp(),
    });

    const userRef = firestore.collection('tenants').doc(tenantId).collection('users').doc(uid);
    batch.set(userRef, {
      id: uid,
      tenantId: tenantId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      createdAt: serverTimestamp(),
    });
    
    // 4. Atomically commit the batch.
    await batch.commit();

    return {
      success: true,
      message: 'User account created successfully. Please log in.',
    };

  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use by another account.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error('Error in signUpWithEmailAndPassword:', error);
    return {
      success: false,
      message: errorMessage,
    };
  }
}
