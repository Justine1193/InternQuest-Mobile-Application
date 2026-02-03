const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const ROLE_ADMIN = "admin";
const ROLE_COORDINATOR = "coordinator";
const ROLE_ADVISER = "adviser";

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).trim().toLowerCase();
  // Backward-compat: treat super_admin as admin
  if (r === "super_admin") return ROLE_ADMIN;
  return r;
}

function normalizeValue(value) {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function assertCanDelete(callerRole, targetRole) {
  if (callerRole === ROLE_ADMIN) {
    // admin can delete coordinator or adviser
    if (targetRole !== ROLE_COORDINATOR && targetRole !== ROLE_ADVISER) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admins can only delete coordinator or adviser accounts."
      );
    }
    return;
  }

  if (callerRole === ROLE_COORDINATOR) {
    // coordinator can delete adviser only
    if (targetRole !== ROLE_ADVISER) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Coordinators can only delete adviser accounts."
      );
    }
    return;
  }

  throw new functions.https.HttpsError(
    "permission-denied",
    "You do not have permission to delete user accounts."
  );
}

/**
 * Callable Cloud Function: deleteUser
 * - Requires Firebase Auth
 * - Requires caller role claim
 * - Enforces role hierarchy
 * - Deletes Firebase Auth user by uid/email
 */
const deleteUser = functions.https.onCall(
  // Optional (recommended): enforce App Check
  // { enforceAppCheck: true },
  async (data, context) => {
    // 1) Require authentication
    if (!context || !context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required."
      );
    }

    // 2) Require caller role claim
    const callerUid = context.auth.uid;
    const callerRole = normalizeRole(context.auth.token?.role);
    if (!callerRole) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Missing caller role claim."
      );
    }

    // 3) Validate input
    const uid = normalizeValue(data?.uid);
    const email = normalizeValue(data?.email);

    if (!uid && !email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Either 'uid' or 'email' must be provided."
      );
    }

    // 4) Resolve target user
    let targetUser;
    try {
      if (uid) {
        targetUser = await admin.auth().getUser(uid);
      } else {
        targetUser = await admin.auth().getUserByEmail(email);
      }
    } catch (err) {
      const code = err?.code || "unknown";
      if (code === "auth/user-not-found") {
        throw new functions.https.HttpsError("not-found", "User not found.");
      }
      throw new functions.https.HttpsError(
        "internal",
        `Failed to resolve user: ${err?.message || code}`
      );
    }

    // 5) Block self-delete (safety)
    if (targetUser.uid === callerUid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "You cannot delete your own account."
      );
    }

    // 6) Determine target role (prefer custom claims; fallback to Firestore user doc)
    let targetRole = normalizeRole(targetUser.customClaims?.role);

    if (!targetRole) {
      try {
        const docSnap = await admin
          .firestore()
          .collection("users")
          .doc(targetUser.uid)
          .get();
        if (docSnap.exists) {
          targetRole = normalizeRole(docSnap.data()?.role);
        }
      } catch (_) {
        // ignore fallback errors
      }
    }

    if (!targetRole) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Target user role is missing; cannot safely enforce permissions."
      );
    }

    // 7) Never allow deleting admin accounts
    if (targetRole === ROLE_ADMIN) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You cannot delete admin accounts."
      );
    }

    // 8) Enforce role hierarchy
    assertCanDelete(callerRole, targetRole);

    // 9) Delete Auth user
    try {
      await admin.auth().deleteUser(targetUser.uid);
      return { success: true, deletedUid: targetUser.uid };
    } catch (err) {
      throw new functions.https.HttpsError(
        "internal",
        `Failed to delete user: ${err?.message || "unknown error"}`
      );
    }
  }
);

module.exports = { deleteUser };