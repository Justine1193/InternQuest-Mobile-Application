// src/services/realtimeDb.js
import { db } from '../firebase/config';
import { ref, onValue, set } from 'firebase/database';

export const listenToStatus = (userId: any, callback: (arg0: any) => void) => {
  const statusRef = ref(db, `status/${userId}`);
  return onValue(statusRef, (snapshot: any) => {
    callback(snapshot.val());
  });
};

export const setUserStatus = async (userId: any, status: unknown) => {
  const statusRef = ref(db, `status/${userId}`);
  await set(statusRef, status);
};

// ---- MOA availability helpers ----
// Listen to all MOA availability values: path 'moaAvailability'
export const listenToMoaAvailability = (callback: (val: any) => void) => {
  const moaRef = ref(db, 'moaAvailability');
  return onValue(moaRef, (snapshot: any) => callback(snapshot.val()));
};

// Write/overwrite the availability value for a company (companyId -> number|null)
export const setMoaAvailabilityForCompany = async (companyId: string, value: number | null) => {
  const companyRef = ref(db, `moaAvailability/${companyId}`);
  await set(companyRef, value);
};

// Atomically change (increment/decrement) availability using runTransaction
// If you need atomic increment/decrement, consider doing that on the server or via a Cloud Function
