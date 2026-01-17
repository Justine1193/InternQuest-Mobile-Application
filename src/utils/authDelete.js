/**
 * Utility functions for deleting Firebase Authentication users
 * Uses a Cloud Function that calls Firebase Admin SDK to delete users
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase.js";
import logger from "./logger";

/**
 * Delete a Firebase Auth user via Cloud Function
 * This calls a Cloud Function that uses Admin SDK to delete the user
 * 
 * @param {string} uid - The UID of the user to delete (preferred)
 * @param {string} email - The email of the user to delete (fallback)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const deleteAuthUser = async (uid = null, email = null) => {
  try {
    if (!functions) {
      logger.warn("Firebase Functions not initialized. Cannot delete Auth user.");
      return false;
    }

    // Validate that at least one identifier is provided and is a valid string
    // Handle both string and number types, and convert to string
    const normalizeValue = (value) => {
      if (value == null) return null;
      const strValue = String(value).trim();
      return strValue.length > 0 ? strValue : null;
    };

    const validUid = normalizeValue(uid);
    const validEmail = normalizeValue(email);

    if (!validUid && !validEmail) {
      logger.warn("Cannot delete Firebase Auth user: No valid UID or email provided", {
        uidProvided: uid != null,
        uidType: typeof uid,
        uidValue: uid,
        emailProvided: email != null,
        emailType: typeof email,
        emailValue: email
      });
      return false;
    }

    // Build payload with only valid values
    const payload = {};
    if (validUid) {
      payload.uid = validUid;
    }
    if (validEmail) {
      payload.email = validEmail;
    }

    logger.log("Calling deleteUser Cloud Function with payload:", payload);

    // Call the Cloud Function to delete the user
    const deleteUserFunction = httpsCallable(functions, "deleteUser");
    const result = await deleteUserFunction(payload);
    
    if (result.data && result.data.success) {
      logger.log("Firebase Auth user deleted successfully");
      return true;
    } else {
      logger.warn("Failed to delete Firebase Auth user:", result.data?.error);
      return false;
    }
  } catch (error) {
    // If Cloud Function doesn't exist, log warning but don't fail
    if (error.code === "functions/not-found" || error.code === "functions/unavailable") {
      logger.warn(
        "Cloud Function 'deleteUser' not found. Please deploy the function to enable Auth user deletion.",
        error
      );
    } else {
      logger.error("Error deleting Firebase Auth user:", error);
    }
    return false;
  }
};

/**
 * Attempt to delete a Firebase Auth user
 * Tries UID first, then email if UID is not available
 * 
 * @param {Object} userData - User data object with uid, email, or firebaseEmail
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const attemptDeleteAuthUser = async (userData) => {
  try {
    if (!userData || typeof userData !== 'object') {
      logger.warn("Invalid userData provided to attemptDeleteAuthUser");
      return false;
    }

    // Extract and normalize values
    const uid = userData.uid;
    const firebaseEmail = userData.firebaseEmail;
    const email = userData.email;

    // Helper to check if a value is a valid non-empty string
    const isValidString = (value) => {
      return value != null && 
             (typeof value === 'string' || typeof value === 'number') && 
             String(value).trim().length > 0;
    };

    // Try to delete by UID first (if available) - most reliable
    if (isValidString(uid)) {
      const uidValue = String(uid).trim();
      logger.log(`Attempting to delete Firebase Auth user by UID: ${uidValue}`);
      const result = await deleteAuthUser(uidValue, null);
      if (result) {
        logger.log("Successfully deleted Firebase Auth user by UID");
        return true;
      }
      logger.warn("Failed to delete Firebase Auth user by UID, trying email...");
    }

    // Try to delete by firebaseEmail (for admins)
    if (isValidString(firebaseEmail)) {
      const emailValue = String(firebaseEmail).trim();
      logger.log(`Attempting to delete Firebase Auth user by firebaseEmail: ${emailValue}`);
      const result = await deleteAuthUser(null, emailValue);
      if (result) {
        logger.log("Successfully deleted Firebase Auth user by firebaseEmail");
        return true;
      }
      logger.warn("Failed to delete Firebase Auth user by firebaseEmail, trying regular email...");
    }

    // Try to delete by email (for students)
    if (isValidString(email)) {
      const emailValue = String(email).trim();
      logger.log(`Attempting to delete Firebase Auth user by email: ${emailValue}`);
      const result = await deleteAuthUser(null, emailValue);
      if (result) {
        logger.log("Successfully deleted Firebase Auth user by email");
        return true;
      }
      logger.warn("Failed to delete Firebase Auth user by email");
    }

    // Log detailed diagnostic information
    logger.warn(
      "Could not delete Firebase Auth user. No valid UID or email found in userData:",
      { 
        hasUid: !!uid, 
        uidType: typeof uid, 
        uidValue: uid,
        uidLength: uid ? String(uid).length : 0,
        hasEmail: !!email, 
        emailType: typeof email,
        emailValue: email,
        emailLength: email ? String(email).length : 0,
        hasFirebaseEmail: !!firebaseEmail,
        firebaseEmailType: typeof firebaseEmail,
        firebaseEmailValue: firebaseEmail
      }
    );
    return false;
  } catch (error) {
    logger.error("Error attempting to delete Firebase Auth user:", error);
    return false;
  }
};

