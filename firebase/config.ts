// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";
import { initializeAuth } from 'firebase/auth/react-native';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

// Note: In production, consider using environment variables
// For React Native, you might want to use react-native-dotenv
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "neuinternshipdb.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "neuinternshipdb",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "neuinternshipdb.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "918910739132",
  appId: process.env.FIREBASE_APP_ID || "1:918910739132:web:bacbcd219ee7228542a6b9",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://neuinternshipdb-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const db = getDatabase(app);
// Use React Native persistence so auth state survives app restarts
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback for environments where react-native persistence isn't available
  // (shouldn't happen in a properly configured React Native app)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  auth = getAuth(app);
}
const storage = getStorage(app);
// Cloud functions (optional) - pick up value from environment variable or Expo runtime config (app.json / eas.json)
import Constants from 'expo-constants';

const extras = (Constants && ((Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra))) || {};

const FUNCTIONS_REGION = process.env.FUNCTIONS_REGION || extras?.FUNCTIONS_REGION || 'asia-southeast1';
const FUNCTIONS_EMULATOR_HOST = process.env.FUNCTIONS_EMULATOR_HOST || extras?.FUNCTIONS_EMULATOR_HOST || '';
const USE_FUNCTIONS_EMULATOR = String(process.env.USE_FUNCTIONS_EMULATOR ?? extras?.USE_FUNCTIONS_EMULATOR ?? '').toLowerCase() === 'true';

const buildFunctionsEmulatorUrl = (functionName: string) => {
  if (!FUNCTIONS_EMULATOR_HOST) return '';
  const projectId = firebaseConfig.projectId;
  return `http://${FUNCTIONS_EMULATOR_HOST}:5001/${projectId}/${FUNCTIONS_REGION}/${functionName}`;
};

const ADMIN_FILE_FROM_ENV = process.env.ADMIN_FILE_FUNCTION_BASE_URL;
const ADMIN_FILE_FROM_CONSTANTS = extras?.ADMIN_FILE_FUNCTION_BASE_URL;
export const ADMIN_FILE_FUNCTION_BASE_URL = ADMIN_FILE_FROM_ENV || ADMIN_FILE_FROM_CONSTANTS || 'https://<region>-<project>.cloudfunctions.net/getAdminFile';

// Optional: Cloud Function to look up email by studentId prior to auth
// REQUIRED: Email addresses are personalized, not derived from Student ID
const LOOKUP_EMAIL_FROM_ENV = process.env.LOOKUP_EMAIL_FUNCTION_BASE_URL;
const LOOKUP_EMAIL_FROM_CONSTANTS = extras?.LOOKUP_EMAIL_FUNCTION_BASE_URL;
export const LOOKUP_EMAIL_FUNCTION_BASE_URL =
  (USE_FUNCTIONS_EMULATOR && FUNCTIONS_EMULATOR_HOST)
    ? buildFunctionsEmulatorUrl('lookupEmailByStudentId')
    : (LOOKUP_EMAIL_FROM_ENV || LOOKUP_EMAIL_FROM_CONSTANTS || '');

// Admin-only: Cloud Function to create user accounts
const CREATE_USER_FROM_ENV = process.env.CREATE_USER_FUNCTION_BASE_URL;
const CREATE_USER_FROM_CONSTANTS = extras?.CREATE_USER_FUNCTION_BASE_URL;
export const CREATE_USER_FUNCTION_BASE_URL =
  (USE_FUNCTIONS_EMULATOR && FUNCTIONS_EMULATOR_HOST)
    ? buildFunctionsEmulatorUrl('createUserAccount')
    : (CREATE_USER_FROM_ENV || CREATE_USER_FROM_CONSTANTS || '');

// Domain to construct fallback auth email from Student ID when no lookup function is configured
// (Not used when LOOKUP_EMAIL_FUNCTION_BASE_URL is configured, which is required for this app)
const STUDENT_ID_DOMAIN_FROM_ENV = process.env.STUDENT_ID_EMAIL_DOMAIN;
const STUDENT_ID_DOMAIN_FROM_CONSTANTS = extras?.STUDENT_ID_EMAIL_DOMAIN;
export const STUDENT_ID_EMAIL_DOMAIN = STUDENT_ID_DOMAIN_FROM_ENV || STUDENT_ID_DOMAIN_FROM_CONSTANTS || 'student.internquest.local';

export { firestore, db, app, auth, storage };
