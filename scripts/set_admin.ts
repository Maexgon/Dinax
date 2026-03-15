
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') });

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const firebaseConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

async function makeAdmin() {
  const adminEmail = 'mgonzalez@nativadigital.com';
  console.log(`Setting admin role for ${adminEmail}...`);

  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', adminEmail).get();

  if (snapshot.empty) {
    console.log('User not found. Creating user profile with admin role...');
    // In a real scenario, the user would exist in Auth.
    // For now, we'll just create or update the profile if it exists by ID if we knew it, 
    // but here we search by email.
    // If we want to be safe, we should wait for the user to login once, or find their UID.
    // Let's assume the user might already exist or we want to pre-emptively set it.
    console.warn('User must exist in Firebase Auth for this to be fully effective.');
  } else {
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      role: 'admin',
      isProfileComplete: true
    });
    console.log(`User ${adminEmail} updated to admin.`);
  }
}

makeAdmin().catch(console.error);
