// Cloud Function: lookupEmailByStudentId
// HTTP endpoint: POST { studentId }
// Returns: { email } if found, else { email: null }
// Secure: uses Firebase Admin SDK and checks optional admin API key header

const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { Expo } = require('expo-server-sdk');

try { initializeApp(); } catch (e) { /* already initialized */ }
setGlobalOptions({ region: 'asia-southeast1' });

const API_KEY = process.env.LOOKUP_EMAIL_API_KEY || null;
const USERS_COLLECTION = process.env.USERS_COLLECTION_PATH || 'users';
const STUDENT_ID_FIELD = process.env.STUDENT_ID_FIELD || 'studentId';

const getBearerToken = (req) => {
  const authHeader = String(req.get('Authorization') || '');
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

const verifyCaller = async (req) => {
  const token = getBearerToken(req);
  if (!token) return { ok: false, status: 401, error: 'Missing Authorization bearer token' };
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return { ok: true, decoded };
  } catch (e) {
    return { ok: false, status: 401, error: 'Invalid auth token' };
  }
};

const isAdminRole = (role) => role === 'admin' || role === 'super_admin';

const sendExpoPush = async ({ tokens, title, body, data }) => {
  const expo = new Expo();
  const messages = [];
  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) continue;
    messages.push({
      to: token,
      sound: 'default',
      title,
      body,
      data: data && typeof data === 'object' ? data : undefined,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    // eslint-disable-next-line no-await-in-loop
    const t = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...t);
  }
  return tickets;
};

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

// Send a push notification to the caller's own device (any authenticated user).
// HTTP endpoint: POST { title, body, data? }
exports.sendPushToSelf = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const verified = await verifyCaller(req);
  if (!verified.ok) return res.status(verified.status).json({ error: verified.error });

  const { uid } = verified.decoded;
  const title = String((req.body && req.body.title) || 'InternQuest');
  const body = String((req.body && req.body.body) || 'You have a new notification.');
  const data = (req.body && req.body.data) || undefined;

  try {
    const db = getFirestore();
    const snap = await db.collection('users').doc(uid).get();
    const expoPushToken = snap.exists ? snap.data().expoPushToken : null;
    if (!expoPushToken || typeof expoPushToken !== 'string') {
      return res.status(400).json({ error: 'No expoPushToken saved for this user' });
    }

    const tickets = await sendExpoPush({ tokens: [expoPushToken], title, body, data });
    return res.status(200).json({ ok: true, ticketsCount: tickets.length, tickets });
  } catch (e) {
    console.error('sendPushToSelf error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Send a push notification to any user (admin/super_admin only).
// HTTP endpoint: POST { userId, title, body, data? }
exports.sendPushToUser = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const verified = await verifyCaller(req);
  if (!verified.ok) return res.status(verified.status).json({ error: verified.error });

  const callerRole = verified.decoded && verified.decoded.role;
  if (!isAdminRole(callerRole)) {
    return res.status(403).json({ error: 'Forbidden: admin role required' });
  }

  const userId = String((req.body && req.body.userId) || '');
  const title = String((req.body && req.body.title) || 'InternQuest');
  const body = String((req.body && req.body.body) || 'You have a new notification.');
  const data = (req.body && req.body.data) || undefined;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const db = getFirestore();
    const snap = await db.collection('users').doc(userId).get();
    if (!snap.exists) return res.status(404).json({ error: 'User not found' });
    const expoPushToken = snap.data().expoPushToken;
    if (!expoPushToken || typeof expoPushToken !== 'string') {
      return res.status(400).json({ error: 'Target user has no expoPushToken saved' });
    }

    const tickets = await sendExpoPush({ tokens: [expoPushToken], title, body, data });
    return res.status(200).json({ ok: true, ticketsCount: tickets.length, tickets });
  } catch (e) {
    console.error('sendPushToUser error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
});
