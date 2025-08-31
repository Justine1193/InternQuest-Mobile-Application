// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';

// Note: In production, consider using environment variables
// For React Native, you might want to use react-native-dotenv
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "neuinternshipdb.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "neuinternshipdb",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "neuinternshipdb.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "918910739132",
  appId: process.env.FIREBASE_APP_ID || "1:918910739132:web:bacbcd219ee7228542a6b9"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { firestore, db, app, auth, storage };
