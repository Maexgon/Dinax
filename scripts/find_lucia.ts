
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
    const tenantId = 'svR2bEqDvsR0hdte6YskNNF46af2';

    console.log('--- Searching for "Lucia" in Tenant Clients ---');

    const snapshot = await db.collection(`tenants/${tenantId}/clients`).get();
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (JSON.stringify(data).includes('Lucia') || JSON.stringify(data).includes('Fleitas')) {
            console.log(`\nFound "Lucia" in doc ID: ${doc.id}`);
            console.log(data);
        }
    });

    console.log('\n--- Searching for "Lucia" in Old User Profile ---');
    const oldSnapshot = await db.collection(`tenants/${tenantId}/user_profile`).get();
    oldSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (JSON.stringify(data).includes('Lucia') || JSON.stringify(data).includes('Fleitas')) {
            console.log(`\nFound "Lucia" in OLD Path doc ID: ${doc.id}`);
            console.log(data);
        }
    });
}

main();
