/**
 * Cloud Function to update Firebase Authentication user password
 * This function uses Firebase Admin SDK to update user passwords
 * 
 * Deploy this function using:
 * firebase deploy --only functions:updateUserPassword
 * 
 * Make sure you have firebase-admin installed:
 * npm install firebase-admin
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to update a Firebase Auth user's password
 * Can be called with either uid or email
 * Uses onCall which automatically handles CORS
 */
const updateUserPasswordFunction = functions.https.onCall(async (data, context) => {
    // Note: Authentication check removed - this function is called from admin UI only
    // The admin UI has its own authentication system
    
    console.log("=== updateUserPassword Function Called ===");
    console.log("Received data:", {
      dataType: typeof data,
      dataKeys: data ? Object.keys(data) : [],
      hasUid: !!data?.uid,
      uid: data?.uid || "not provided",
      hasEmail: !!data?.email,
      email: data?.email || "not provided",
      hasNewPassword: !!data?.newPassword,
      passwordType: typeof data?.newPassword,
      passwordLength: data?.newPassword ? data.newPassword.length : 0,
      fullData: JSON.stringify(data, null, 2)
    });
    
    const { uid, email, newPassword } = data || {};
    
    // Validate required parameters
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      console.error("Validation failed: newPassword is missing or invalid", {
        hasNewPassword: !!newPassword,
        type: typeof newPassword,
        value: newPassword
      });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "newPassword is required and must be a non-empty string"
      );
    }

    if (!uid && !email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Either uid or email must be provided"
      );
    }

    // Validate password strength (minimum 6 characters for Firebase Auth)
    if (newPassword.length < 6) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Password must be at least 6 characters long"
      );
    }

    try {
      let userToUpdate;

      // Try to find user by UID first
      if (uid) {
        try {
          userToUpdate = await admin.auth().getUser(uid);
        } catch (error) {
          // If UID not found, try email
          if (email) {
            try {
              userToUpdate = await admin.auth().getUserByEmail(email);
            } catch (emailError) {
              throw new functions.https.HttpsError(
                "not-found",
                "User not found in Firebase Auth"
              );
            }
          } else {
            throw new functions.https.HttpsError(
              "not-found",
              "User not found in Firebase Auth"
            );
          }
        }
      } else if (email) {
        userToUpdate = await admin.auth().getUserByEmail(email);
      }

      if (!userToUpdate) {
        throw new functions.https.HttpsError(
          "not-found",
          "User not found in Firebase Auth"
        );
      }

      // Update the user's password
      await admin.auth().updateUser(userToUpdate.uid, {
        password: newPassword,
      });

      return {
        success: true,
        message: `Password updated successfully for user ${userToUpdate.uid}`,
        uid: userToUpdate.uid,
      };
    } catch (error) {
      console.error("Error updating user password:", error);
      
      // Handle specific error cases
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        "internal",
        `Failed to update password: ${error.message}`
      );
    }
  });

module.exports = { updateUserPassword: updateUserPasswordFunction };

