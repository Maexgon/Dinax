
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
    const clientId = '5Mw0CqRCq45XO4X18oBz'; // Lucia / Gonzalezme

    console.log(`--- Inspecting Data for Client ${clientId} ---`);

    // Path 1: Refactored Path (Client Dashboard uses this)
    const refactoredPath = `tenants/${tenantId}/clients/${clientId}`;
    const refactoredDoc = await db.doc(refactoredPath).get();
    console.log(`\n[PATH: ${refactoredPath}]`);
    console.log(refactoredDoc.exists ? refactoredDoc.data() : 'DOES NOT EXIST');

    // Path 2: Old Path (Maybe Coach View uses this?)
    const oldPath = `tenants/${tenantId}/user_profile/${clientId}`;
    const oldDoc = await db.doc(oldPath).get();
    console.log(`\n[PATH: ${oldPath}]`);
    console.log(oldDoc.exists ? oldDoc.data() : 'DOES NOT EXIST');

    // Path 3: Global User (Auth Link)
    const authUid = 'imofiwtbDXeL0eQ0DfU6flU6ZXF2'; // From previous debug
    const globalPath = `users/${authUid}`;
    const globalDoc = await db.doc(globalPath).get();
    console.log(`\n[PATH: ${globalPath}]`);
    console.log(globalDoc.exists ? globalDoc.data() : 'DOES NOT EXIST');
}

main();
