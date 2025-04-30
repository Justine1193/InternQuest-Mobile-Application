// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",
  authDomain: "neuinternshipdb.firebaseapp.com",
  databaseURL: "https://neuinternshipdb-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "neuinternshipdb",
  storageBucket: "neuinternshipdb.appspot.com",
  messagingSenderId: "918910739132",
  appId: "1:918910739132:web:bacbcd219ee7228542a6b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
