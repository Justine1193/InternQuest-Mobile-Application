/**
 * Cloud Function to delete Firebase Authentication users
 * This function uses Firebase Admin SDK to delete users
 * 
 * Deploy this function using:
 * firebase deploy --only functions:deleteUser
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
 * Cloud Function to delete a Firebase Auth user
 * Can be called with either uid or email
 */
const deleteUserFunction = functions.https.onCall(async (data, context) => {
  // Verify the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to delete users"
    );
  }

  // Verify the user is an admin (you can customize this check)
  // For now, we'll allow any authenticated user (you should add role checking)
  const { uid, email } = data;

  if (!uid && !email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Either uid or email must be provided"
    );
  }

  try {
    let userToDelete;

    // Try to find user by UID first
    if (uid) {
      try {
        userToDelete = await admin.auth().getUser(uid);
      } catch (error) {
        // If UID not found, try email
        if (email) {
          userToDelete = await admin.auth().getUserByEmail(email);
        } else {
          throw error;
        }
      }
    } else if (email) {
      userToDelete = await admin.auth().getUserByEmail(email);
    }

    if (!userToDelete) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found in Firebase Auth"
      );
    }

    // Delete the user
    await admin.auth().deleteUser(userToDelete.uid);

    return {
      success: true,
      message: `User ${userToDelete.uid} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError(
      "internal",
      `Failed to delete user: ${error.message}`
    );
  }
});

module.exports = { deleteUser: deleteUserFunction };

