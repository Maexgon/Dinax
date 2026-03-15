
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!projectId) {
    console.error('Project ID not found in .env.local');
    process.exit(1);
}

const sa = {
    "type": "service_account",
    "project_id": projectId,
    "private_key_id": "unknown",
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": "unknown",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/" + encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)
};

const saPath = path.resolve(process.cwd(), 'serviceAccount.json');
fs.writeFileSync(saPath, JSON.stringify(sa, null, 2));
console.log('Created serviceAccount.json');

try {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = saPath;
    console.log(`Deploying Firestore Rules for project ${projectId}...`);

    // We must use the locally installed firebase-tools
    execSync(`npx firebase deploy --only firestore:rules --project ${projectId}`, {
        stdio: 'inherit',
        env: { ...process.env, GOOGLE_APPLICATION_CREDENTIALS: saPath }
    });
    console.log('Deployment successful.');
} catch (error) {
    console.error('Deployment failed:', error.message);
} finally {
    if (fs.existsSync(saPath)) {
        fs.unlinkSync(saPath);
        console.log('Cleaned up serviceAccount.json');
    }
}
