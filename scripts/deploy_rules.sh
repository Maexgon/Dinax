#!/bin/bash
set -e

# Extract env vars
PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
PRIVATE_KEY=$FIREBASE_PRIVATE_KEY

# Create service account file
cat <<EOF > serviceAccount.json
{
  "type": "service_account",
  "project_id": "$PROJECT_ID",
  "private_key_id": "unknown",
  "private_key": "$PRIVATE_KEY",
  "client_email": "$CLIENT_EMAIL",
  "client_id": "unknown",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/$(urlencode "$CLIENT_EMAIL")"
}
EOF

# Escape function if needed, but simplified for now.
# Actually, PRIVATE_KEY contains newlines which might break JSON if not handled.
# A node script is safer to write the JSON.

rm serviceAccount.json

node scripts/create_sa_file.js

export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/serviceAccount.json

echo "Deploying Firestore Rules for project $PROJECT_ID..."
npx firebase deploy --only firestore:rules --project $PROJECT_ID

rm serviceAccount.json
echo "Done."
