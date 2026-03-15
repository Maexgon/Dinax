
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

        console.log('Listing users (Tenants)...');
        const usersSnap = await db.collection('users').limit(5).get();

        if (usersSnap.empty) {
            console.log('No users found in "users" collection.');
            return;
        }

        for (const userDoc of usersSnap.docs) {
            console.log(`Found Coach/Tenant ID: ${userDoc.id}`);
            // Check for clients
            const clientsSnap = await userDoc.ref.collection('clients').limit(1).get();
            if (!clientsSnap.empty) {
                const clientDoc = clientsSnap.docs[0];
                console.log(`  -> Found Client ID: ${clientDoc.id}`);
                console.log(`  -> Client Data:`, clientDoc.data());

                // We found a pair! Let's use this.
                console.log('--- VALID PAIR FOUND ---');
                console.log(`Tenant ID: ${userDoc.id}`);
                console.log(`Client ID: ${clientDoc.id}`);

                // Update the test user profile with this pair
                const itemsRef = db.collection('user_profile').where('email', '==', 'gonzalezme@gmail.com');
                const itemsSnap = await itemsRef.get();

                if (!itemsSnap.empty) {
                    const profileRef = itemsSnap.docs[0].ref;
                    await profileRef.set({
                        tenantId: userDoc.id,
                        clientId: clientDoc.id,
                        isProfileComplete: true,
                        role: 'client'
                    }, { merge: true });
                    console.log(`Updated 'gonzalezme@gmail.com' with real Tenant/Client IDs.`);
                } else {
                    console.error("Test user 'gonzalezme@gmail.com' not found in user_profile.");
                }
                return;
            } else {
                console.log(`  -> No clients found for this coach.`);
            }
        }
    } catch (error) {
        console.error('Error finding data:', error);
    }
}

main();
