
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
    const clientId = '5Mw0CqRCq45XO4X18oBz';
    const tenantId = 'svR2bEqDvsR0hdte6YskNNF46af2';

    console.log('--- Inspecting Root user_profile ---');
    const rootProfile = await db.collection('user_profile').doc(clientId).get();
    console.log(rootProfile.exists ? rootProfile.data() : 'Does not exist');

    console.log('\n--- Inspecting Tenant Document (tenants collection) ---');
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    console.log(tenantDoc.exists ? tenantDoc.data() : 'Does not exist');

    console.log('\n--- Inspecting Tenant Document (users collection - old assumption) ---');
    const usersTenantDoc = await db.collection('users').doc(tenantId).get();
    console.log(usersTenantDoc.exists ? usersTenantDoc.data() : 'Does not exist');

    console.log('\n--- Inspecting user_profile INSIDE Tenant (tenants/{id}/user_profile) ---');
    const innerProfile = await db.collection(`tenants/${tenantId}/user_profile`).doc(clientId).get();
    console.log(innerProfile.exists ? innerProfile.data() : 'Does not exist');

    if (innerProfile.exists) {
        console.log('  -> Checking subcollections of inner profile...');
        const collections = await innerProfile.ref.listCollections();
        collections.forEach(col => console.log(`     - ${col.id}`));
    }

    console.log('\n--- Inspecting clients INSIDE Tenant (tenants/{id}/clients) ---');
    const innerClients = await db.collection(`tenants/${tenantId}/clients`).doc(clientId).get();
    console.log(innerClients.exists ? innerClients.data() : 'Does not exist');
}

main();
