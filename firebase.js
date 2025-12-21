import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase config (from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",
  authDomain: "neuinternshipdb.firebaseapp.com",
  databaseURL:
    "https://neuinternshipdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "neuinternshipdb",
  // IMPORTANT: use the correct Storage bucket domain (firebasestorage.app)
  storageBucket: "neuinternshipdb.firebasestorage.app",
  messagingSenderId: "918910739132",
  appId: "1:918910739132:web:bacbcd219ee7228542a6b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore, Auth, Realtime DB, Storage, and Functions
const auth = getAuth(app);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { auth, db, realtimeDb, storage, functions };