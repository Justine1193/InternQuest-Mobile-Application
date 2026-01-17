/**
 * Utility functions for updating Firebase Authentication user passwords
 * Uses a Cloud Function that calls Firebase Admin SDK to update passwords
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase.js";
import logger from "./logger";

// Ensure functions are initialized with the correct region
// If functions is not initialized, this will be handled by the import

/**
 * Update a Firebase Auth user's password via Cloud Function
 * This calls a Cloud Function that uses Admin SDK to update the password
 * 
 * @param {string} uid - The UID of the user to update (preferred)
 * @param {string} email - The email of the user to update (fallback)
 * @param {string} newPassword - The new password to set
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const updateAuthUserPassword = async (uid = null, email = null, newPassword = null) => {
  try {
    if (!functions) {
      logger.warn("Firebase Functions not initialized. Cannot update Auth user password.");
      return false;
    }

    // Validate password is provided and not empty
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      logger.error("New password is required and must be a non-empty string", {
        hasPassword: !!newPassword,
        type: typeof newPassword,
        length: newPassword ? newPassword.length : 0
      });
      return false;
    }

    // Call the Cloud Function to update the password
    const updatePasswordFunction = httpsCallable(functions, "updateUserPassword");
    
    // Prepare the data object, ensuring newPassword is always included
    const callData = {
      newPassword: newPassword.trim() // Ensure it's a string and trim whitespace
    };
    
    // Only add uid or email if they are provided (not null/undefined/empty)
    if (uid && uid.trim && uid.trim() !== '') {
      callData.uid = uid.trim();
    } else if (uid) {
      callData.uid = uid;
    }
    
    if (email && email.trim && email.trim() !== '') {
      callData.email = email.trim();
    } else if (email) {
      callData.email = email;
    }
    
    // Validate that we have either uid or email
    if (!callData.uid && !callData.email) {
      logger.error("Either uid or email must be provided for password update");
      return false;
    }
    
    // Final validation - ensure password is in the callData
    if (!callData.newPassword || callData.newPassword === '') {
      logger.error("Password is missing from callData object before calling Cloud Function");
      return false;
    }
    
    console.log("Calling Cloud Function with data:", {
      hasUid: !!callData.uid,
      uid: callData.uid || "not provided",
      hasEmail: !!callData.email,
      email: callData.email || "not provided",
      hasPassword: !!callData.newPassword,
      passwordLength: callData.newPassword ? callData.newPassword.length : 0,
      passwordType: typeof callData.newPassword,
      callDataKeys: Object.keys(callData),
      callDataPreview: JSON.stringify({ ...callData, newPassword: callData.newPassword ? `[${callData.newPassword.length} chars]` : 'missing' })
    });
    
    const result = await updatePasswordFunction(callData);
    
    if (result.data && result.data.success) {
      logger.log("Firebase Auth user password updated successfully");
      return true;
    } else {
      logger.warn("Failed to update Firebase Auth user password:", result.data?.error);
      return false;
    }
  } catch (error) {
    // Handle different error types
    if (error.code === "functions/not-found" || error.code === "functions/unavailable") {
      logger.warn(
        "Cloud Function 'updateUserPassword' not found. Please deploy the function to enable Auth password updates.",
        error
      );
    } else if (error.code === "functions/unauthenticated") {
      logger.warn(
        "Authentication required for password update. User must be logged in with Firebase Auth.",
        error
      );
    } else if (error.code === "internal" || error.message?.includes("CORS") || error.message?.includes("cors")) {
      logger.warn(
        "CORS error or internal error when calling updateUserPassword. The function may not be properly deployed or configured. Please deploy the function: firebase deploy --only functions:updateUserPassword",
        error
      );
    } else {
      logger.error("Error updating Firebase Auth user password:", {
        code: error.code,
        message: error.message,
        error: error
      });
    }
    return false;
  }
};

/**
 * Attempt to update a Firebase Auth user's password
 * Tries UID first, then email if UID is not available
 * 
 * @param {Object} userData - User data object with uid, email, or firebaseEmail
 * @param {string} newPassword - The new password to set
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const attemptUpdateAuthPassword = async (userData, newPassword) => {
  // Validate password is provided
  if (!newPassword || newPassword.trim() === "") {
    logger.error("New password is required for password update");
    return false;
  }
  
  const { uid, email, firebaseEmail } = userData || {};
  // Prefer firebaseEmail since that's what's used for Firebase Auth
  const emailToUse = firebaseEmail || email;
  
  console.log("Attempting password update with:", {
    uid: uid || "not provided",
    email: email || "not provided",
    firebaseEmail: firebaseEmail || "not provided",
    emailToUse: emailToUse || "not provided",
    passwordLength: newPassword ? newPassword.length : 0
  });
  
  // Try UID first, then firebaseEmail (preferred), then regular email
  if (uid) {
    console.log("Attempting password update with UID:", uid);
    const success = await updateAuthUserPassword(uid, null, newPassword);
    if (success) {
      console.log("Password update successful using UID");
      return true;
    }
    console.log("Password update failed with UID, trying email...");
  }
  
  if (emailToUse) {
    console.log("Attempting password update with email:", emailToUse);
    const success = await updateAuthUserPassword(null, emailToUse, newPassword);
    if (success) {
      console.log("Password update successful using email");
      return true;
    }
    console.log("Password update failed with email");
  }
  
  logger.warn("No UID or email provided for password update", {
    hasUid: !!uid,
    hasEmail: !!email,
    hasFirebaseEmail: !!firebaseEmail
  });
  return false;
};

