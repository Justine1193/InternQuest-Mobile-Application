// src/services/firestore.js
import { firestore } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const getUserProfile = async (userId: string) => {
  const ref = doc(firestore, 'users', userId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};

export const saveUserProfile = async (userId: string, data: any) => {
  const ref = doc(firestore, 'users', userId);
  await setDoc(ref, data, { merge: true });
};

export const listenToStatus = (userId: string, callback: (data: any) => void) => {
  const statusRef = doc(firestore, 'users', userId);
  return onSnapshot(statusRef, (snapshot) => {
    callback(snapshot.data());
  });
};

export const setUserStatus = async (userId: string, status: any) => {
  const statusRef = doc(firestore, 'users', userId);
  await setDoc(statusRef, { status }, { merge: true });
};
