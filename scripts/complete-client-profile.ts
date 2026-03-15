import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function getFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

async function main() {
    const email = 'gonzalezme@gmail.com';
    console.log(`Looking for user with email: ${email}`);

    try {
        const app = getFirebaseAdminApp();
        const auth = getAuth(app);
        const db = getFirestore(app);

        const user = await auth.getUserByEmail(email);
        console.log(`Found user: ${user.uid}`);

        const profileRef = db.collection('user_profile').doc(user.uid);
        await profileRef.set({
            isProfileComplete: true,
            role: 'client',
            tenantId: 'some-coach-id', // Placeholder
            clientId: 'some-client-id',
            email: email,
            firstName: 'Mariano',
            lastName: 'Gonzalez',
            photoURL: user.photoURL || '',
        }, { merge: true });

        console.log(`Updated profile for ${email}: isProfileComplete = true`);
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

main();
