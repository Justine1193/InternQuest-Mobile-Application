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

    // Call the Cloud Function to delete the user
    const deleteUserFunction = httpsCallable(functions, "deleteUser");
    const result = await deleteUserFunction({ uid, email });
    
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
    // Try to delete by UID first (if available) - most reliable
    if (userData.uid) {
      const result = await deleteAuthUser(userData.uid, null);
      if (result) return true;
    }

    // Try to delete by firebaseEmail (for admins)
    if (userData.firebaseEmail) {
      const result = await deleteAuthUser(null, userData.firebaseEmail);
      if (result) return true;
    }

    // Try to delete by email (for students)
    if (userData.email) {
      const result = await deleteAuthUser(null, userData.email);
      if (result) return true;
    }

    logger.warn(
      "Could not delete Firebase Auth user. No UID or email found."
    );
    return false;
  } catch (error) {
    logger.error("Error attempting to delete Firebase Auth user:", error);
    return false;
  }
};

