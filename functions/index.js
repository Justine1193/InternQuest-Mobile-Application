// Cloud Function: lookupEmailByStudentId
// HTTP endpoint: POST { studentId }
// Returns: { email } if found, else { email: null }
// Secure: uses Firebase Admin SDK and checks optional admin API key header

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

try { initializeApp(); } catch (e) { /* already initialized */ }
setGlobalOptions({ region: 'asia-southeast1' });

const API_KEY = process.env.LOOKUP_EMAIL_API_KEY || null;
const USERS_COLLECTION = process.env.USERS_COLLECTION_PATH || 'users';
const STUDENT_ID_FIELD = process.env.STUDENT_ID_FIELD || 'studentId';

exports.lookupEmailByStudentId = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId } = req.body || {};
    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({ error: 'studentId is required' });
    }

    if (API_KEY) {
      const headerKey = req.get('X-API-Key');
      if (headerKey !== API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const db = getFirestore();
    // Try exact match first
    let snap = await db.collection(USERS_COLLECTION).where(STUDENT_ID_FIELD, '==', studentId).limit(1).get();
    // Fallback: try normalized studentId without hyphens
    if (snap.empty) {
      const normalizedId = String(studentId).replace(/-/g, '');
      snap = await db.collection(USERS_COLLECTION).where(STUDENT_ID_FIELD, '==', normalizedId).limit(1).get();
    }
    if (snap.empty) {
      return res.status(200).json({ email: null });
    }
    const data = snap.docs[0].data();
    const email = (data && typeof data.email === 'string') ? data.email : null;
    return res.status(200).json({ email });
  } catch (err) {
    console.error('lookupEmailByStudentId error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Admin-provisioned account creation (requires admin/super_admin auth; optional X-API-Key)
exports.createUserAccount = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Safety: when running locally via the Functions emulator, Admin SDK calls still hit production
    // unless you also run the Auth/Firestore emulators. Block by default.
    const isEmulator = !!process.env.FIREBASE_EMULATOR_HUB || process.env.FUNCTIONS_EMULATOR === 'true';
    const allowEmulatorWrites = process.env.ALLOW_EMULATOR_CREATE_USER === 'true';
    if (isEmulator && !allowEmulatorWrites) {
      return res.status(403).json({
        error: 'createUserAccount is disabled in emulator by default. Set ALLOW_EMULATOR_CREATE_USER=true if you intend to create real accounts.'
      });
    }

    const adminAuth = getAuth();

    // Verify caller is signed-in AND has role=admin|super_admin (custom claims)
    const authHeader = String(req.get('Authorization') || '');
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: 'Missing Authorization bearer token' });
    }

    const decoded = await adminAuth.verifyIdToken(match[1]);
    const callerRole = decoded && decoded.role;
    if (callerRole !== 'admin' && callerRole !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    // Optional extra gate: API key
    const headerKey = req.get('X-API-Key');
    if (API_KEY && headerKey !== API_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const body = req.body || {};
    const { email, password, studentId, firstName, lastName, role } = body;

    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email is required' });
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'password is required' });
    if (!studentId || typeof studentId !== 'string') return res.status(400).json({ error: 'studentId is required' });

    const allowedRoles = ['student', 'admin', 'super_admin'];
    const useRole = allowedRoles.includes(role) ? role : 'student';

    const user = await adminAuth.createUser({ email, password, displayName: [firstName, lastName].filter(Boolean).join(' ') });

    if (useRole === 'admin' || useRole === 'super_admin') {
      await adminAuth.setCustomUserClaims(user.uid, { role: useRole });
    }

    const db = getFirestore();
    await db.collection('users').doc(user.uid).set({
      email,
      studentId,
      firstName: firstName || '',
      lastName: lastName || '',
      role: useRole,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ uid: user.uid, role: useRole });
  } catch (err) {
    console.error('createUserAccount error:', err);
    const msg = err && err.message ? err.message : 'Internal error';
    return res.status(500).json({ error: msg });
  }
});
