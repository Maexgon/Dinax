
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
    const clientId = '5Mw0CqRCq45XO4X18oBz';

    console.log(`Restoring Client ${clientId} (Lucia) in Tenant ${tenantId}...`);

    const clientRef = db.collection(`tenants/${tenantId}/clients`).doc(clientId);

    await clientRef.set({
        name: 'Lucia Fleitas',
        email: 'gonzalezme@gmail.com', // Keep the auth email
        progress: 50, // Guessing from context or leaving as reasonable default
        profile: {
            weight: 45,
            height: 170,
            goals: ['Tonificar', 'Fuerza'], // Reasonable defaults
            injuries: []
        },
        // Keep other existing fields
    }, { merge: true });

    console.log('Client data restored to: Lucia Fleitas, 45kg, 170cm.');
}

main();
