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
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "neuinternshipdb.appspot.com",
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

const fromEnv = process.env.ADMIN_FILE_FUNCTION_BASE_URL;
const fromConstants = (Constants && ((Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra)))?.ADMIN_FILE_FUNCTION_BASE_URL;
export const ADMIN_FILE_FUNCTION_BASE_URL = fromEnv || fromConstants || 'https://<region>-<project>.cloudfunctions.net/getAdminFile';

export { firestore, db, app, auth, storage };
