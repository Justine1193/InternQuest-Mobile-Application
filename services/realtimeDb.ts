// src/services/realtimeDb.js
import { db } from '../firebase/config';
import { ref, onValue, set } from 'firebase/database';

export const listenToStatus = (userId: any, callback: (arg0: any) => void) => {
  const statusRef = ref(db, `status/${userId}`);
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const setUserStatus = async (userId: any, status: unknown) => {
  const statusRef = ref(db, `status/${userId}`);
  await set(statusRef, status);
};
