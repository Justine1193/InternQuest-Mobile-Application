/*
 * create_ojt_logs_for_users.js
 * Safe admin migration script to create a sample OJT log for a user or for all users
 * Usage:
 *  - node create_ojt_logs_for_users.js --user <USER_ID>
 *  - node create_ojt_logs_for_users.js --all
 *
 * Requires a service account JSON pointed by GOOGLE_APPLICATION_CREDENTIALS or
 * passed using --key <path-to-service-account.json>
 */

const admin = require('firebase-admin');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
  try {
    const keyPath = argv.key || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!keyPath) {
      console.error('Service account key required. Provide with --key or set GOOGLE_APPLICATION_CREDENTIALS env var.');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert(require(keyPath))
    });

    const db = admin.firestore();

    const sampleLog = (userId) => {
      const now = new Date();
      return {
        date: now.toISOString().split('T')[0].replace(/-/g, '/'), // YYYY/MM/DD
        clockIn: '09:00 AM',
        clockOut: '12:00 PM',
        hours: '3',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'migration-script',
        userId
      };
    };

    if (argv.user) {
      const userId = argv.user;
      const colRef = db.collection(`users/${userId}/ojtLogs`);
      const docRef = colRef.doc();
      await docRef.set(sampleLog(userId));
      console.log('Created sample OJT log for user', userId, 'doc id:', docRef.id);
      process.exit(0);
    }

    if (argv.all) {
      console.log('Creating sample OJT logs for ALL users. This will create one sample OJT doc per user.');
      const usersSnap = await db.collection('users').get();
      console.log('Users found:', usersSnap.size);
      for (const u of usersSnap.docs) {
        const uid = u.id;
        const colRef = db.collection(`users/${uid}/ojtLogs`);
        const docRef = colRef.doc();
        await docRef.set(sampleLog(uid));
        console.log('-> created', docRef.id, 'for', uid);
      }

      console.log('Done creating sample OJT logs for all users.');
      process.exit(0);
    }

    console.log('No operation specified. Use --user <UID> or --all');
    process.exit(1);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
