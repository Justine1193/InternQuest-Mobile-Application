/**
 * Callable Cloud Function: createUserWithRole
 *
 * GOAL:
 * - Admins can create users with roles: admin, coordinator, adviser
 * - Coordinators can create users with role: adviser only
 * - Advisers cannot create users
 *
 * SECURITY:
 * - Caller must be authenticated
 * - Caller role is read from custom claims: context.auth.token.role
 * - Enforce role hierarchy strictly
 *
 * USER CREATION:
 * - Create user by email only (NO password)
 * - Assign role via custom claims
 * - Generate a Firebase password reset link
 * - Send password setup link via email
 * - Do NOT log or store passwords
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { sendEmail } = require("./sendEmail");

if (!admin.apps.length) {
  admin.initializeApp();
}

const ROLE_ADMIN = "admin";
const ROLE_COORDINATOR = "coordinator";
const ROLE_ADVISER = "adviser";

// Only coordinator and adviser accounts are created from this function per spec
const ALLOWED_TARGET_ROLES = new Set([ROLE_COORDINATOR, ROLE_ADVISER]);

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).trim().toLowerCase();
  // Backward-compat: treat super_admin as admin
  if (r === "super_admin") return ROLE_ADMIN;
  return r;
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const e = email.trim();
  // simple sanity check (Firebase Auth will do deeper validation)
  return e.includes("@") && e.includes(".");
}

function assertCanCreate(callerRole, targetRole) {
  if (callerRole === ROLE_ADMIN) {
    // Admin can create coordinator and adviser accounts
    if (!ALLOWED_TARGET_ROLES.has(targetRole)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Admins can only create coordinator or adviser accounts from this function."
      );
    }
    return;
  }
  if (callerRole === ROLE_COORDINATOR) {
    if (targetRole !== ROLE_ADVISER) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Coordinators can only create adviser accounts."
      );
    }
    return;
  }
  throw new functions.https.HttpsError(
    "permission-denied",
    "You do not have permission to create user accounts."
  );
}

const createUserWithRole = functions.https.onCall(async (data, context) => {
  // Validate caller authentication
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

  const email = data?.email ? String(data.email).trim() : "";
  const username = data?.username ? String(data.username).trim() : "";
  const requestedRole = normalizeRole(data?.role);

  if (!isValidEmail(email)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid 'email' is required."
    );
  }

  if (!username) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A non-empty 'username' is required."
    );
  }

  if (!requestedRole || !ALLOWED_TARGET_ROLES.has(requestedRole)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "A valid 'role' is required ('coordinator' or 'adviser')."
    );
  }

  // Normalize & validate sections (optional)
  let sections = [];
  if (Array.isArray(data?.sections)) {
    sections = data.sections
      .map((s) => ({
        year: s?.year ? String(s.year).trim() : "",
        programCode: s?.programCode ? String(s.programCode).trim() : "",
        section: s?.section ? String(s.section).trim() : "",
      }))
      .filter((s) => s.year && s.programCode && s.section);
  }

  // Enforce role hierarchy rules
  assertCanCreate(callerRole, requestedRole);

  try {
    // Create user by email only (no password)
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        emailVerified: false,
        disabled: false,
      });
    } catch (e) {
      if (e?.code === "auth/email-already-exists") {
        throw new functions.https.HttpsError(
          "already-exists",
          "A user with this email already exists."
        );
      }
      if (e?.code === "auth/invalid-email") {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid email address."
        );
      }
      throw e;
    }

    // Assign role via custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: requestedRole,
      mustSetPassword: true,
    });

    // Create Firestore user document
    const db = admin.firestore();
    await db.collection("users").doc(userRecord.uid).set({
      email,
      username,
      role: requestedRole,
      sections,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate password setup link (password reset link)
    const cfg = functions.config() || {};
    const baseUrl = cfg.app?.base_url ? String(cfg.app.base_url) : null;
    const actionCodeSettings = baseUrl
      ? { url: baseUrl, handleCodeInApp: false }
      : undefined;

    const resetLink = await admin
      .auth()
      .generatePasswordResetLink(email, actionCodeSettings);

    // Send email with link
    const subject = "Set up your InternQuest Admin password";
    const safeRoleLabel =
      requestedRole === ROLE_ADMIN
        ? "Admin"
        : requestedRole === ROLE_COORDINATOR
          ? "Coordinator"
          : "Adviser";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to InternQuest Admin</h2>
        <p>An account was created for you with the role: <strong>${safeRoleLabel}</strong>.</p>
        <p>Please set your password using the link below:</p>
        <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">Set your password</a></p>
        <p>If you did not expect this email, you can ignore it.</p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });

    return { success: true };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) {
      throw err;
    }

    // Firebase Admin SDK errors we didn't map explicitly
    const code = err?.code || "unknown";
    const message = err?.message || "Unknown error occurred";

    throw new functions.https.HttpsError(
      "internal",
      `Failed to create user: ${message} (${code})`
    );
  }
});

module.exports = { createUserWithRole };

