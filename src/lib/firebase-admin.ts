import 'server-only';
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Config moved inside function for better error handling on invocation

export function getFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    }

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error('Missing Firebase Admin Credentials:');
        console.error('PROJECT_ID:', !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        console.error('CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
        console.error('PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
        // We will not throw here to avoid crashing the whole app on boot, but actions using it will fail.
    }

    // Cert requires projectId (camelCase) when passing object!
    // Wait, the error "must contain a string project_id" suggests it WAS looking for snake_case?
    // Actually, documentation says: "The object must contain the following fields: projectId, clientEmail, and privateKey."
    // BUT if you pass a JSON object (parsed from file), it has snake_case.
    // Let's try matching the standard `ServiceAccount` interface which usually expects camelCase in generic usages, 
    // OR we can just pass the path if we had a file.
    // Let's try constructing it with camelCase which is safer for the `ServiceAccount` type in TS.

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

export function getAdminFirestore() {
    const app = getFirebaseAdminApp();
    return getFirestore(app);
}

export function getAdminAuth() {
    const app = getFirebaseAdminApp();
    return getAuth(app);
}
