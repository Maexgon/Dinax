
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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
    const clientId = '5Mw0CqRCq45XO4X18oBz'; // Lucia

    // Matches logic in page.tsx
    const eventsRef = db.collection(`tenants/${tenantId}/events`);
    const snapshot = await eventsRef
        .where('clients', 'array-contains', clientId)
        .get();

    console.log(`Query "clients array-contains ${clientId}" found ${snapshot.size} events.`);
    snapshot.forEach(doc => {
        console.log(`- ${doc.id}: ${doc.data().title} @ ${doc.data().start.toDate()}`);
    });
}

main();
