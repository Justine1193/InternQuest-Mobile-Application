// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",
  authDomain: "neuinternshipdb.firebaseapp.com",
  projectId: "neuinternshipdb",
  storageBucket: "neuinternshipdb.appspot.com",
  messagingSenderId: "918910739132",
  appId: "1:918910739132:web:bacbcd219ee7228542a6b9"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { firestore, db, app, auth, storage };
