/*
 * Migration script: migrate Firestore helpDeskFiles documents that store base64/fileData
 * into Google Cloud Storage objects and update the Firestore document with path + url.
 *
 * Usage:
 * 1. Place a service account key (JSON) and set GOOGLE_APPLICATION_CREDENTIALS to its path,
 *    or set FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH environment variable.
 * 2. Set the project id or ensure your service account matches the project.
 * 3. Run: node migrate_helpdesk_files_to_storage.js
 *
 * This script will:
 *  - scan all documents under 'helpDeskFiles',
 *  - for documents containing `fileData` (data url) or `contentBase64`, it will upload the binary
 *    to Cloud Storage under `helpDeskFiles/<uploadedBy||migrated>/<docId>_<fileName>`,
 *  - set a download token and construct a download URL, update the Firestore doc with `path` and `url`,
 *  - set `storedInFirestore: false` and clear the `fileData` / `contentBase64` fields.
 *
 * IMPORTANT: Always run this against a copy (or test) project first. Keep backups.
 */

const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const SERVICE_KEY_PATH = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!SERVICE_KEY_PATH || !fs.existsSync(SERVICE_KEY_PATH)) {
  console.error('Missing service account key. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH to a valid file path.');
  process.exit(1);
}

const serviceAccount = require(SERVICE_KEY_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: (process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`),
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function migrate() {
  console.log('Starting helpDeskFiles migration...');

  const snap = await db.collection('helpDeskFiles').get();
  console.log(`Found ${snap.size} documents.`);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const id = docSnap.id;

    if (!data) continue;

    // Skip documents that already point to storage
    if (data.path || data.url) {
      console.log(`Skipping ${id} - already has path/url.`);
      continue;
    }

    let base64 = null;
    let contentType = data.fileType || data.contentType || 'application/octet-stream';
    let filename = (data.fileName || data.name || `migrated_${id}`).replace(/[^a-z0-9_.-]/gi, '_');

    if (data.fileData) {
      // data URL like data:<type>;base64,<base64>
      const match = String(data.fileData).match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        contentType = match[1] || contentType;
        base64 = match[2];
      } else {
        console.warn(`fileData for ${id} doesn't look like a data URL; skipping`);
        continue;
      }
    } else if (data.contentBase64) {
      base64 = String(data.contentBase64);
    }

    if (!base64) {
      console.log(`Skipping ${id} - no base64 or data URL found.`);
      continue;
    }

    try {
      const buffer = Buffer.from(base64, 'base64');
      const uploader = data.uploadedBy || 'migrated';
      const remotePath = `helpDeskFiles/${uploader}/${Date.now()}_${filename}`;
      const file = bucket.file(remotePath);
      const token = uuidv4();

      await file.save(buffer, {
        metadata: {
          contentType,
          metadata: {
            firebaseStorageDownloadTokens: token,
          },
        },
      });

      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(remotePath)}?alt=media&token=${token}`;

      await db.collection('helpDeskFiles').doc(id).update({
        path: remotePath,
        url: downloadUrl,
        storedInFirestore: false,
        fileType: contentType,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        fileData: admin.firestore.FieldValue.delete(),
        contentBase64: admin.firestore.FieldValue.delete(),
      });

      console.log(`Migrated ${id} -> ${remotePath}`);
    } catch (err) {
      console.error(`Failed to migrate ${id}`, err);
    }
  }

  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration script failed', err);
  process.exit(1);
});
