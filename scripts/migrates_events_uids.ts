
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

    console.log(`Migrating events to include 'uids' in Tenant ${tenantId}...`);

    const eventsRef = db.collection(`tenants/${tenantId}/events`);
    const snapshot = await eventsRef.get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const clientIds = data.clients || [];

        const uids = [];

        for (const clientId of clientIds) {
            // Fetch Client Doc to get userId
            const clientDoc = await db.doc(`tenants/${tenantId}/clients/${clientId}`).get();
            if (clientDoc.exists) {
                const clientData = clientDoc.data();
                if (clientData?.userId) {
                    uids.push(clientData.userId);
                }
            }
        }

        if (uids.length > 0) {
            await doc.ref.update({ uids });
            console.log(`Updated event ${doc.id} with uids: ${uids}`);
        } else {
            console.log(`Skipping event ${doc.id} (no linked userIds found)`);
        }
    }
}

main();
