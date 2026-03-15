
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

    console.log(`Seeding events for Client ${clientId} in Tenant ${tenantId}...`);

    const eventsRef = db.collection(`tenants/${tenantId}/events`);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 19:00

    const event1 = {
        title: 'Entrenamiento Tarde',
        start: Timestamp.fromDate(tomorrow),
        end: Timestamp.fromDate(new Date(tomorrow.getTime() + 60 * 60 * 1000)), // +1 hour
        clients: [clientId],
        completed: false,
        location: 'Gimnasio Principal',
        workPlan: 'Rutina de Piernas y Glúteos',
        type: 'training' // Assuming we have types
    };

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0); // 10:00

    const event2 = {
        title: 'Evaluación Mensual',
        start: Timestamp.fromDate(nextWeek),
        end: Timestamp.fromDate(new Date(nextWeek.getTime() + 60 * 60 * 1000)),
        clients: [clientId],
        completed: false,
        location: 'Consultorio',
        workPlan: 'Medición de pliegues y peso',
        type: 'assessment'
    };

    await eventsRef.add(event1);
    await eventsRef.add(event2);

    console.log('Seeded 2 events for Lucia.');
}

main();
