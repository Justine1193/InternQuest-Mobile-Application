/*
  Provision a user (Auth + Firestore) for InternQuest.

  Requirements:
  - Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase Admin service account JSON file
    OR run `gcloud auth application-default login` (ADC).

  Usage examples:
    node tools/provisioning/provision_user.js --email "student@neu.edu.ph" --password "Temp#12345" --studentId "22-12345-678" --firstName "Student" --lastName "Name"

    node tools/provisioning/provision_user.js --email "admin@neu.edu.ph" --password "Temp#12345" --studentId "00-00000-000" --role admin

  Notes:
  - For students, the app signs in by Student ID -> lookup function -> email/password.
    So you must keep Firestore field `studentId` consistent.
*/

const minimist = require('minimist');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

const printHelp = () => {
  // Intentionally plain text (no markdown) so it reads well in terminals.
  console.log(`
InternQuest provisioning CLI

Required:
  --email <email>
  --password <temporary password>
  --studentId <XX-XXXXX-XXX>

Optional:
  --firstName <string>
  --lastName <string>
  --role <student|admin|super_admin>   (default: student)
  --projectId <firebase project id>    (only needed for some ADC setups)
  --dryRun                             (prints actions, does not write)
  --updateIfExists                     (updates existing Auth user + Firestore doc)

Auth:
  Option A (recommended): set env var GOOGLE_APPLICATION_CREDENTIALS to a service account JSON.
  Option B: use Application Default Credentials via: gcloud auth application-default login

Examples:
  npm run provision:user -- --email "student@neu.edu.ph" --password "Temp#12345" --studentId "22-12345-678" --firstName "Student" --lastName "Name"
  npm run provision:user -- --email "admin@neu.edu.ph" --password "Temp#12345" --studentId "00-00000-000" --role admin
`);
};

const args = minimist(process.argv.slice(2), {
  string: ['email', 'password', 'studentId', 'firstName', 'lastName', 'role', 'projectId'],
  boolean: ['dryRun', 'updateIfExists', 'help'],
  alias: { h: 'help' },
  default: { role: 'student', dryRun: false, updateIfExists: false },
});

if (args.help) {
  printHelp();
  process.exit(0);
}

const email = (args.email || '').trim();
const password = String(args.password || '');
const studentId = (args.studentId || '').trim();
const firstName = (args.firstName || '').trim();
const lastName = (args.lastName || '').trim();
const role = String(args.role || 'student').trim();
const projectId = (args.projectId || '').trim();

const allowedRoles = new Set(['student', 'admin', 'super_admin']);
if (!allowedRoles.has(role)) {
  console.error(`Invalid --role: ${role}. Allowed: student|admin|super_admin`);
  process.exit(1);
}

if (!email || !password || !studentId) {
  console.error('Missing required args. Use --help for usage.');
  process.exit(1);
}

const studentIdRegex = /^\d{2}-\d{5}-\d{3}$/;
if (!studentIdRegex.test(studentId)) {
  console.error('Invalid --studentId format. Expected XX-XXXXX-XXX (digits + hyphens).');
  process.exit(1);
}

const initAdmin = () => {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS (service account). If set, initialize via cert.
  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac && fs.existsSync(gac)) {
    const serviceAccount = JSON.parse(fs.readFileSync(gac, 'utf8'));
    initializeApp({ credential: cert(serviceAccount), projectId: projectId || serviceAccount.project_id });
    return;
  }

  // Fallback to ADC.
  initializeApp({ credential: applicationDefault(), projectId: projectId || undefined });
};

const run = async () => {
  initAdmin();

  const adminAuth = getAuth();
  const db = getFirestore();

  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();

  const planned = {
    email,
    studentId,
    role,
    displayName: displayName || undefined,
    updateIfExists: !!args.updateIfExists,
  };

  if (args.dryRun) {
    console.log('DRY RUN - would provision:', JSON.stringify(planned, null, 2));
    return;
  }

  let userRecord = null;

  if (args.updateIfExists) {
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (e) {
      userRecord = null;
    }
  }

  if (!userRecord) {
    userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
    });
    console.log('Created Auth user:', userRecord.uid);
  } else {
    userRecord = await adminAuth.updateUser(userRecord.uid, {
      password,
      displayName: displayName || undefined,
    });
    console.log('Updated Auth user:', userRecord.uid);
  }

  if (role === 'admin' || role === 'super_admin') {
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });
    console.log('Set custom claims role:', role);
  }

  await db.collection('users').doc(userRecord.uid).set(
    {
      email,
      studentId,
      firstName,
      lastName,
      role,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('Upserted Firestore doc: users/' + userRecord.uid);
  console.log('Done.');
};

run().catch((err) => {
  console.error('Provisioning failed:', err && err.message ? err.message : err);
  process.exit(1);
});
