
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
    try {
        const app = getFirebaseAdminApp();
        const db = getFirestore(app);
        const auth = getAuth(app);

        // 1. Create/Get Coach
        const coachEmail = 'coach@demo.com';
        let coachUser;
        try {
            coachUser = await auth.getUserByEmail(coachEmail);
        } catch (e) {
            console.log('Creating coach user...');
            coachUser = await auth.createUser({ email: coachEmail, password: 'Password123!' });
        }
        const coachId = coachUser.uid;
        console.log(`Coach ID: ${coachId}`);

        // Create Coach Profile
        await db.collection('user_profile').doc(coachId).set({
            email: coachEmail,
            role: 'coach',
            isProfileComplete: true,
            firstName: 'Coach',
            lastName: 'Demo'
        }, { merge: true });

        // Create Coach Tenant Doc (users/{coachId})
        await db.collection('users').doc(coachId).set({
            name: 'Demo Club',
            email: coachEmail,
        }, { merge: true });

        // 2. Create Client under Coach
        const clientRef = db.collection(`users/${coachId}/clients`).doc();
        const clientId = clientRef.id;
        console.log(`Created Client ID: ${clientId}`);

        await clientRef.set({
            name: 'Mariano Gonzalez',
            email: 'gonzalezme@gmail.com',
            phone: '1234567890',
            active: true,
            profile: {
                weight: 88, // Different from placeholder to verify update
                height: 180,
                goals: ['Strength', 'Power'],
                injuries: []
            },
            progress: 45 // Different from placeholder
        });

        // 3. Link Test User to this Client
        const testUserEmail = 'gonzalezme@gmail.com';
        const testUser = await auth.getUserByEmail(testUserEmail);

        await db.collection('user_profile').doc(testUser.uid).set({
            tenantId: coachId,
            clientId: clientId,
            isProfileComplete: true,
            role: 'client',
            firstName: 'Mariano',
            lastName: 'Gonzalez'
        }, { merge: true });

        console.log(`Seeding complete. Test user ${testUserEmail} linked to Coach ${coachId}, Client ${clientId}.`);

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

main();
