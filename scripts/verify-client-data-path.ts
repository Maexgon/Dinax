
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

        // 1. Get User Profile
        const profileRef = db.collection('user_profile').doc(user.uid);
        const profileSnap = await profileRef.get();

        if (!profileSnap.exists) {
            console.error('User profile not found');
            return;
        }

        const profile = profileSnap.data();
        console.log('User Profile Data:', profile);

        const { tenantId, clientId } = profile!;

        if (!tenantId || !clientId) {
            console.error('Missing tenantId or clientId in profile');
            return;
        }

        // 2. Check Client Data Path
        // Path A: users/{tenantId}/clients/{clientId}
        const clientPathA = `users/${tenantId}/clients/${clientId}`;
        console.log(`Checking Path A: ${clientPathA}`);
        const clientSnapA = await db.doc(clientPathA).get();

        if (clientSnapA.exists) {
            console.log('Found Client Data at Path A:', clientSnapA.data());
        } else {
            console.log('Path A not found.');
        }

        // Path B: users/{tenantId}/user_profile/{clientId} (User suggested "tenant-user_profile-clientId")
        const clientPathB = `users/${tenantId}/user_profile/${clientId}`;
        console.log(`Checking Path B: ${clientPathB}`);
        const clientSnapB = await db.doc(clientPathB).get();

        if (clientSnapB.exists) {
            console.log('Found Client Data at Path B:', clientSnapB.data());
        } else {
            console.log('Path B not found.');
        }

    } catch (error) {
        console.error('Error verifying paths:', error);
    }
}

main();
