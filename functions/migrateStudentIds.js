const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const ROLE_ADMIN = "admin";

function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).trim().toLowerCase();
  // Backward-compat: treat super_admin as admin
  if (r === "super_admin") return ROLE_ADMIN;
  return r;
}

function toNonEmptyString(value) {
  if (value == null) return "";
  const s = String(value).trim();
  return s.length ? s : "";
}

/**
 * Callable Cloud Function: migrateStudentIds
 *
 * Purpose:
 * - Backfill `studentId` from legacy `studentNumber`
 * - Optionally remove `studentNumber` from Firestore docs
 *
 * Only callable by: admin/super_admin (via custom claim `role`)
 *
 * Input (optional):
 * - dryRun: boolean (default false)
 * - deleteStudentNumber: boolean (default true)
 * - batchSize: number (default 300, max 450)
 */
const migrateStudentIds = functions.https.onCall(async (data, context) => {
  // 1) Require authentication
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication required."
    );
  }

  // 2) Require admin role claim
  const callerRole = normalizeRole(context.auth.token?.role);
  if (callerRole !== ROLE_ADMIN) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only Super Admin can run migrations."
    );
  }

  const dryRun = Boolean(data?.dryRun);
  const deleteStudentNumber =
    data?.deleteStudentNumber === undefined ? true : Boolean(data.deleteStudentNumber);

  const requestedBatchSize = Number(data?.batchSize);
  const batchSize = Number.isFinite(requestedBatchSize)
    ? Math.min(Math.max(requestedBatchSize, 50), 450)
    : 300;

  const db = admin.firestore();
  const { FieldValue } = admin.firestore;

  const collections = ["users", "deleted_students"];

  const resultsByCollection = {};

  let totalScanned = 0;
  let totalUpdatedStudentId = 0;
  let totalRemovedStudentNumber = 0;
  let totalSkipped = 0;

  for (const colName of collections) {
    let scanned = 0;
    let updatedStudentId = 0;
    let removedStudentNumber = 0;
    let skipped = 0;

    let lastDoc = null;

    // Iterate collection in pages
    while (true) {
      let q = db
        .collection(colName)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(batchSize);

      if (lastDoc) {
        q = q.startAfter(lastDoc);
      }

      const snap = await q.get();
      if (snap.empty) break;

      const batch = db.batch();
      let batchWrites = 0;

      snap.docs.forEach((docSnap) => {
        scanned += 1;
        totalScanned += 1;

        const d = docSnap.data() || {};

        const studentId = toNonEmptyString(d.studentId);
        const studentNumber = toNonEmptyString(d.studentNumber);

        // Only touch docs that look like student docs
        const looksLikeStudent = Boolean(studentId || studentNumber);
        if (!looksLikeStudent) {
          skipped += 1;
          totalSkipped += 1;
          return;
        }

        const update = {};
        let changed = false;

        // Backfill studentId if missing
        if (!studentId && studentNumber) {
          update.studentId = studentNumber;
          changed = true;
          updatedStudentId += 1;
          totalUpdatedStudentId += 1;
        }

        // Remove legacy field if requested
        if (deleteStudentNumber && d.studentNumber !== undefined) {
          update.studentNumber = FieldValue.delete();
          changed = true;
          removedStudentNumber += 1;
          totalRemovedStudentNumber += 1;
        }

        if (changed) {
          update.updatedAt = new Date().toISOString();
          if (!dryRun) {
            batch.update(docSnap.ref, update);
            batchWrites += 1;
          }
        } else {
          skipped += 1;
          totalSkipped += 1;
        }
      });

      if (!dryRun && batchWrites > 0) {
        await batch.commit();
      }

      lastDoc = snap.docs[snap.docs.length - 1];

      // Safety: avoid very long running callables; stop after ~5000 docs TOTAL per call
      if (totalScanned >= 5000) break;
    }

    resultsByCollection[colName] = {
      scanned,
      updatedStudentId,
      removedStudentNumber,
      skipped,
    };

    if (totalScanned >= 5000) break;
  }

  return {
    success: true,
    dryRun,
    deleteStudentNumber,
    batchSize,
    collections,
    resultsByCollection,
    scanned: totalScanned,
    updatedStudentId: totalUpdatedStudentId,
    removedStudentNumber: totalRemovedStudentNumber,
    skipped: totalSkipped,
    note:
      totalScanned >= 5000
        ? "Stopped early at 5000 docs for safety. Call again to continue."
        : "Completed.",
  };
});

module.exports = { migrateStudentIds };

