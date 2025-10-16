import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
// Import your service account JSON
import * as serviceAccount from '../mbokofit-fd3ab-firebase-adminsdk-fbsvc-69391834bb.json';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  storageBucket: 'mbokofit-fd3ab.firebasestorage.app',
});

// Get a reference to the default bucket
export const bucket = admin.storage().bucket();