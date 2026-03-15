
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function getFirebaseAdminApp() {
    if (getApps().length > 0) return getApps()[0];
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    return initializeApp({ credential: cert(serviceAccount) });
}

async function main() {
    const db = getFirestore(getFirebaseAdminApp());

    // Real IDs from user's earlier comment and script output
    const clientId = '5Mw0CqRCq45XO4X18oBz';
    // Note: user said authenticated user gonzalezme... is this clientId.
    // We need to confirm if 'users' collection has the profile for auth UID.
    // The migration script moved global 'user_profile' -> 'users'.
    // But wait, the AUTH UID for 'gonzalezme@gmail.com' might be different from '5Mw...'?
    // User said "el usuario gonzalezme@gmail.com es el clienteId 5Mw0CqRCq45XO4X18oBz".
    // This implies the Client Document ID is 5Mw... 
    // But the Auth UID is likely different!

    // Let's find the Auth UID for email first.
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth(getFirebaseAdminApp());

    try {
        const userRecord = await auth.getUserByEmail('gonzalezme@gmail.com');
        const authUid = userRecord.uid;
        console.log(`Auth UID for 'gonzalezme@gmail.com': ${authUid}`);

        console.log(`\n--- 1. Check Global Profile (path: users/${authUid}) ---`);
        const globalProfile = await db.collection('users').doc(authUid).get();
        if (globalProfile.exists) {
            console.log('Found Global Profile:', globalProfile.data());
            const data = globalProfile.data();
            const { tenantId, clientId: profileClientId } = data || {};

            if (tenantId && profileClientId) {
                console.log(`\n--- 2. Fetch Client Data (path: tenants/${tenantId}/clients/${profileClientId}) ---`);
                const clientDoc = await db.collection(`tenants/${tenantId}/clients`).doc(profileClientId).get();
                if (clientDoc.exists) {
                    console.log('Found Client Data:', clientDoc.data());
                } else {
                    console.error('ERROR: Client Data Document NOT FOUND at expected path.');
                }
            } else {
                console.error('ERROR: Global Profile missing tenantId or clientId.');
            }
        } else {
            console.error('ERROR: Global Profile NOT FOUND.');
        }

    } catch (e) {
        console.error('Error fetching user by email:', e);
    }
}

main();
