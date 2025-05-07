// src/services/firestore.js
import { firestore } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const getUserProfile = async (userId: string) => {
  const ref = doc(firestore, 'users', userId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? snapshot.data() : null;
};

export const saveUserProfile = async (userId: string, data: any) => {
  const ref = doc(firestore, 'users', userId);
  await setDoc(ref, data);
};
