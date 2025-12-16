'use server';

import admin from 'firebase-admin';

// Helper function to initialize Firebase Admin SDK.
// It ensures that the app is initialized only once.
function initializeServerSideAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // IMPORTANT: For production, you must set the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable. In a local/dev environment, this will use the
  // credentials from gcloud auth application-default login.
  return admin.initializeApp();
}

export async function signUpWithEmailAndPassword(
  prevState: any,
  formData: FormData
) {
  const adminApp = initializeServerSideAdmin();
  const auth = admin.auth(adminApp);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  try {
    // Step 1: Create the user in Firebase Authentication.
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });
    
    // Step 2: Return the user's UID and other necessary data to the client.
    // The client will handle signing in and creating the Firestore documents.
    return {
      success: true,
      message: 'User account created. Finalizing setup...',
      uid: userRecord.uid,
      email,
      password, // Pass password back to client for sign-in
      firstName,
      lastName,
    };

  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred during sign-up.';
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
