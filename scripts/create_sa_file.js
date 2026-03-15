
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const sa = {
    "type": "service_account",
    "project_id": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "private_key_id": "unknown",
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": "unknown",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/" + encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)
};

fs.writeFileSync('serviceAccount.json', JSON.stringify(sa, null, 2));
console.log('Created serviceAccount.json');
