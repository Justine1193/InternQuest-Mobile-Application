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
  if (r === "super_admin") return ROLE_ADMIN;
  return r;
}

const listManagedUsers = functions.https.onCall(async (data, context) => {
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required."
    );
  }

  const callerRole = normalizeRole(context.auth.token?.role);
  if (!callerRole) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Missing caller role claim."
    );
  }

  const db = admin.firestore();

  try {
    let query = db.collection("users");

    if (callerRole === ROLE_ADMIN) {
      // Admins can list coordinator and adviser accounts
      query = query.where("role", "in", [ROLE_COORDINATOR, ROLE_ADVISER]);
    } else if (callerRole === ROLE_COORDINATOR) {
      // Coordinators can list adviser accounts only
      query = query.where("role", "==", ROLE_ADVISER);
    } else {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You do not have permission to list managed users."
      );
    }

    const snapshot = await query.get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        uid: doc.id,
        email: data.email || null,
        username: data.username || null,
        role: data.role || null,
        sections: Array.isArray(data.sections) ? data.sections : [],
        createdAt: data.createdAt || null,
      };
    });

    return { users };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }

    const code = err?.code || "unknown";
    const message = err?.message || "Unknown error occurred";

    throw new functions.https.HttpsError(
      "internal",
      `Failed to list managed users: ${message} (${code})`
    );
  }
});

module.exports = { listManagedUsers };

