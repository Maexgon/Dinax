import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

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
  try {
    const app = getFirebaseAdminApp();
    const rules = getSecurityRules(app);

    console.log('Reading Firestore Security Rules from src/firestore.rules...');
    const rulesPath = path.resolve(process.cwd(), 'src/firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    console.log('Updating Firestore Security Rules...');

    // Corrected argument structure for createRuleset
    const ruleset = await rules.createRuleset({
      name: 'firestore.rules',
      content: rulesContent
    });

    const release = await rules.releaseFirestoreRuleset(ruleset.name);
    console.log('Rules updated successfully.');

  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

main();
