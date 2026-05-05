/**
 * Utility functions for updating Firebase Authentication user passwords
 * Uses a Cloud Function that calls Firebase Admin SDK to update passwords
 */

import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../../firebase.js";
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

    // Check if user is authenticated - use currentUser directly
    if (!auth.currentUser) {
      logger.error("User is not authenticated. Cannot update password without authentication.", {
        authState: "no currentUser"
      });
      return false;
    }

    const currentUser = auth.currentUser;
    
    // Refresh the auth token to ensure it's valid and up-to-date
    let authToken;
    try {
      authToken = await currentUser.getIdToken(true); // Force refresh
    } catch (tokenError) {
      logger.error("Failed to refresh auth token:", tokenError);
      return false;
    }

    // Verify auth state is still valid after token refresh
    if (!auth.currentUser || auth.currentUser.uid !== currentUser.uid) {
      logger.error("Auth currentUser changed after token refresh", {
        expectedUid: currentUser.uid,
        actualUid: auth.currentUser?.uid
      });
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

    // Wait a brief moment to ensure auth state is fully propagated
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify auth state one more time before calling
    if (!auth.currentUser) {
      logger.error("Auth currentUser became null before calling Cloud Function");
      return false;
    }

    // Call the Cloud Function to update the password
    // httpsCallable should automatically include the auth token from auth.currentUser
    const updatePasswordFunction = httpsCallable(functions, "updateUserPassword", {
      timeout: 60000 // 60 second timeout
    });
    
    // Prepare the data object, ensuring newPassword is always included
    const callData = {
      newPassword: newPassword.trim() // Ensure it's a string and trim whitespace
    };
    
    // Only add uid or email if they are provided (not null/undefined/empty)
    if (uid && typeof uid === 'string' && uid.trim() !== '') {
      callData.uid = uid.trim();
    } else if (uid && typeof uid !== 'string') {
      callData.uid = String(uid);
    }
    
    if (email && typeof email === 'string' && email.trim() !== '') {
      callData.email = email.trim();
    } else if (email && typeof email !== 'string') {
      callData.email = String(email);
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
    const errorCode = error.code || "";
    const errorMessage = error.message || "";
    
    console.error("Error updating Firebase Auth user password:", {
      code: errorCode,
      message: errorMessage,
      details: error.details,
      fullError: error
    });
    
    if (errorCode === "functions/not-found" || errorCode === "functions/unavailable") {
      logger.warn(
        "Cloud Function 'updateUserPassword' not found. Please deploy the function to enable Auth password updates.",
        error
      );
    } else if (errorCode === "functions/unauthenticated") {
      logger.warn(
        "Authentication required for password update. User must be logged in with Firebase Auth.",
        error
      );
    } else if (errorCode === "functions/internal" || errorCode === "internal" || errorMessage?.includes("INTERNAL") || errorMessage?.includes("CORS") || errorMessage?.includes("cors")) {
      logger.error(
        "Internal server error when calling updateUserPassword. This may indicate:\n" +
        "1. The function encountered an unexpected error\n" +
        "2. The function may need to be redeployed\n" +
        "3. Check Firebase Functions logs for more details\n" +
        "Error details: " + errorMessage,
        error
      );
    } else if (errorCode === "functions/invalid-argument") {
      logger.error(
        "Invalid argument provided to updateUserPassword: " + errorMessage,
        error
      );
    } else if (errorCode === "functions/not-found") {
      logger.error(
        "User not found: " + errorMessage,
        error
      );
    } else {
      logger.error("Error updating Firebase Auth user password:", {
        code: errorCode,
        message: errorMessage,
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
  
  if (uid) {
    const success = await updateAuthUserPassword(uid, null, newPassword);
    if (success) return true;
  }
  
  if (emailToUse) {
    const success = await updateAuthUserPassword(null, emailToUse, newPassword);
    if (success) return true;
  }
  
  logger.warn("No UID or email provided for password update", {
    hasUid: !!uid,
    hasEmail: !!email,
    hasFirebaseEmail: !!firebaseEmail
  });
  return false;
};

