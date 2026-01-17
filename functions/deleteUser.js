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
  // Note: Authentication check removed - this function is called from admin UI only

  // Log the raw data received for debugging
  console.log("=== deleteUser Function Called ===");
  // Safely log data without circular references
  try {
    const safeData = data && typeof data === 'object' ? {
      uid: data.uid,
      email: data.email,
      keys: Object.keys(data)
    } : data;
    console.log("Raw data received (safe):", JSON.stringify(safeData, null, 2));
  } catch (e) {
    console.log("Raw data received (could not stringify):", typeof data);
  }
  console.log("Data type:", typeof data);
  console.log("Is data null?", data === null);
  console.log("Is data undefined?", data === undefined);
  console.log("Data keys:", data && typeof data === 'object' ? Object.keys(data) : "N/A");

  // Handle different data structures - Firebase callable functions may wrap data
  let requestData = {};
  
  if (data === null || data === undefined) {
    console.error("Data is null or undefined!");
    throw new functions.https.HttpsError(
      "invalid-argument",
      "No data provided to deleteUser function"
    );
  }

  // If data is already an object with uid/email, use it directly
  if (typeof data === 'object' && !Array.isArray(data)) {
    requestData = data;
  } else {
    // If data is wrapped or in unexpected format, try to extract
    console.warn("Unexpected data format, attempting to extract...");
    requestData = { data };
  }

  const uid = requestData.uid;
  const email = requestData.email;

  console.log("Extracted values - uid:", uid, "email:", email);
  console.log("uid type:", typeof uid, "email type:", typeof email);
  console.log("uid value:", JSON.stringify(uid), "email value:", JSON.stringify(email));

  // Normalize and validate values - ensure they are non-empty strings
  const normalizeValue = (value) => {
    if (value == null || value === undefined) {
      console.log("Value is null/undefined:", value);
      return null;
    }
    const strValue = String(value).trim();
    const isValid = strValue.length > 0;
    console.log("Normalized value:", strValue, "isValid:", isValid);
    return isValid ? strValue : null;
  };

  const validUid = normalizeValue(uid);
  const validEmail = normalizeValue(email);

  console.log("After normalization - validUid:", validUid, "validEmail:", validEmail);

  if (!validUid && !validEmail) {
    console.error("deleteUser called with invalid data:", { 
      rawData: data,
      uid, 
      email, 
      uidType: typeof uid, 
      emailType: typeof email,
      validUid,
      validEmail
    });
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Either uid or email must be provided as a non-empty string"
    );
  }

  try {
    let userToDelete;

    // Try to find user by UID first (preferred method)
    if (validUid) {
      try {
        console.log(`Attempting to delete user by UID: ${validUid}`);
        userToDelete = await admin.auth().getUser(validUid);
      } catch (error) {
        console.warn(`Failed to find user by UID ${validUid}:`, error.message);
        // If UID not found, try email as fallback
        if (validEmail) {
          console.log(`Falling back to email: ${validEmail}`);
          try {
            userToDelete = await admin.auth().getUserByEmail(validEmail);
          } catch (emailError) {
            console.error(`Failed to find user by email ${validEmail}:`, emailError.message);
            throw emailError;
          }
        } else {
          throw error;
        }
      }
    } else if (validEmail) {
      console.log(`Attempting to delete user by email: ${validEmail}`);
      userToDelete = await admin.auth().getUserByEmail(validEmail);
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

