// Better shims for firebase named exports used in this project.
declare module 'firebase/app' {
  export function initializeApp(...args: any[]): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(...args: any[]): any;
  export function doc(...args: any[]): any;
  export function getDoc(...args: any[]): Promise<any> | any;
  export function setDoc(...args: any[]): Promise<any> | any;
  export function collection(...args: any[]): any;
  export function addDoc(...args: any[]): Promise<any> | any;
  export function getDocs(...args: any[]): Promise<any> | any;
  export function query(...args: any[]): any;
  export function where(...args: any[]): any;
  export function orderBy(...args: any[]): any;
  export function startAt(...args: any[]): any;
  export function endAt(...args: any[]): any;
  export function updateDoc(...args: any[]): Promise<any> | any;
  export function deleteDoc(...args: any[]): Promise<any> | any;
  export function onSnapshot(ref: any, cb: (snap: any) => any): any;
  export function serverTimestamp(): any;
  export const Timestamp: any;
}

declare module 'firebase/storage' {
  export function getStorage(...args: any[]): any;
  export function ref(...args: any[]): any;
  export function uploadBytes(...args: any[]): any;
  export function getDownloadURL(...args: any[]): any;
}

declare module 'firebase/database' {
  export function getDatabase(...args: any[]): any;
  export function ref(...args: any[]): any;
  export function onValue(...args: any[]): any;
  export function set(...args: any[]): any;
}

declare module 'firebase/auth' {
  export function getAuth(...args: any[]): any;
  export function createUserWithEmailAndPassword(...args: any[]): any;
  export function signInWithEmailAndPassword(...args: any[]): any;
  export function sendPasswordResetEmail(...args: any[]): any;
  export function onAuthStateChanged(auth: any, cb: (user: any) => any): any;
  export function signOut(...args: any[]): any;
  export function deleteUser(...args: any[]): any;
  export function updatePassword(...args: any[]): any;
  export const EmailAuthProvider: any;
  export function reauthenticateWithCredential(...args: any[]): any;
  export function updateProfile(...args: any[]): any;
}

declare module 'firebase/auth/react-native' {
  export function initializeAuth(...args: any[]): any;
  export function getReactNativePersistence(...args: any[]): any;
}

// Allow importing '@react-native-async-storage/async-storage' without types
declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

