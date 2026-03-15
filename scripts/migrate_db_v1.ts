
import * as dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load environment variables from .env.local
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
    console.log('--- Starting Database Migration V1 ---');

    // 1. Rename Global user_profile -> users
    console.log('\n[1/3] Migrating Global user_profile -> users...');
    const profilesSnap = await db.collection('user_profile').get();
    let usersCount = 0;

    const batch = db.batch();
    let opCount = 0;

    for (const doc of profilesSnap.docs) {
        const data = doc.data();
        const newRef = db.collection('users').doc(doc.id);

        // Transform data if needed, or just copy
        batch.set(newRef, data);
        // batch.delete(doc.ref); // Safer to NOT delete yet, verify first
        usersCount++;
        opCount++;

        if (opCount >= 400) {
            await batch.commit();
            opCount = 0;
        }
    }
    if (opCount > 0) await batch.commit();
    console.log(`Migrated ${usersCount} global profiles.`);

    // 2. Rename Tenant user_profile -> clients & Update Members
    console.log('\n[2/3] Migrating Tenant Data & updating Members...');

    // Need to find all tenants. Assuming 'users' collection (OLD Name) or 'tenants' collection contains tenants?
    // Current logic uses 'users' collection as tenants based on previous scripts.
    // Wait, the user said "belong to tenantId svR...". Let's check 'tenants' collection and 'users' collection.
    // In `inspect_db_structure.ts`, `tenants` collection had the data.

    const tenantsSnap = await db.collection('tenants').get();
    console.log(`Found ${tenantsSnap.size} tenants.`);

    for (const tenantDoc of tenantsSnap.docs) {
        const tenantId = tenantDoc.id;
        console.log(`Processing Tenant: ${tenantId}`);

        const oldClientsRef = tenantDoc.ref.collection('user_profile');
        const oldClientsSnap = await oldClientsRef.get();

        if (oldClientsSnap.empty) {
            console.log(`  -> No clients found in user_profile for this tenant.`);
            continue;
        }

        const tenantBatch = db.batch();
        let tenantOpCount = 0;
        const membersUpdate: any = {};

        for (const clientDoc of oldClientsSnap.docs) {
            const clientData = clientDoc.data();
            const clientId = clientDoc.id;

            // Move to 'clients' subcollection
            const newClientRef = tenantDoc.ref.collection('clients').doc(clientId);
            tenantBatch.set(newClientRef, clientData);

            // Add to members list
            // Mapping: uid -> role
            if (clientData.userId || clientData.id) {
                // Use userId if present (linked auth user), otherwise clientId (if not yet linked?)
                // Actually members map usually uses Auth UID.
                // clientData usually has 'email' or 'userId'.
                // If it has a specific Auth UID linked, use that.
                const uid = clientData.userId || clientId; // Fallback
                membersUpdate[`members.${uid}`] = 'client';
            }

            tenantOpCount++;
        }

        // Update Tenant Document with new members
        if (Object.keys(membersUpdate).length > 0) {
            tenantBatch.update(tenantDoc.ref, membersUpdate);
            tenantOpCount++;
        }

        await tenantBatch.commit();
        console.log(`  -> Migrated ${oldClientsSnap.size} clients for tenant ${tenantId}.`);
    }

    console.log('\n--- Migration Complete ---');
    console.log('NOTE: Original collections (user_profile, tenants/*/user_profile) were NOT deleted.');
    console.log('Please verify data and then manually delete them or run a cleanup script.');
}

main();
