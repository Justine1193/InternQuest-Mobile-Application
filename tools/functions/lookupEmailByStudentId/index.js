// Cloud Function: lookupEmailByStudentId
// HTTP endpoint: POST { studentId }
// Returns: { email } if found, else { email: null }
// Secure: uses Firebase Admin SDK and checks optional admin API key header

const functions = require('firebase-functions');
const admin = require('firebase-admin');

try { admin.initializeApp(); } catch (e) { /* already initialized */ }

const API_KEY = process.env.LOOKUP_EMAIL_API_KEY || null;

exports.lookupEmailByStudentId = functions.region('asia-southeast1').https.onRequest(async (req, res) => {
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

    const db = admin.firestore();
    const snap = await db.collection('users').where('studentId', '==', studentId).limit(1).get();
    if (snap.empty) {
      return res.status(200).json({ email: null });
    }
    const data = snap.docs[0].data();

    // Account block enforcement (support common schemas)
    const accountAccess = (data && typeof data.accountAccess === 'object' && data.accountAccess) ? data.accountAccess : null;
    const isBlocked =
      (accountAccess && accountAccess.isBlocked === true) ||
      data?.isBlocked === true ||
      data?.is_blocked === true ||
      data?.blocked === true ||
      String(data?.accountStatus || '').toLowerCase() === 'blocked' ||
      String(data?.status || '').toLowerCase() === 'blocked';

    if (isBlocked) {
      const reason =
        (accountAccess && typeof accountAccess.blockedReason === 'string' && accountAccess.blockedReason.trim()) ? accountAccess.blockedReason.trim() :
        (typeof data?.blockedReason === 'string' && data.blockedReason.trim()) ? data.blockedReason.trim() :
        (typeof data?.blockReason === 'string' && data.blockReason.trim()) ? data.blockReason.trim() :
        null;
      const blockedBy =
        (accountAccess && typeof accountAccess.blockedBy === 'string' && accountAccess.blockedBy.trim()) ? accountAccess.blockedBy.trim() :
        (typeof data?.blockedBy === 'string' && data.blockedBy.trim()) ? data.blockedBy.trim() :
        null;
      return res.status(403).json({ error: 'ACCOUNT_BLOCKED', reason, blockedBy });
    }

    const email = (data && typeof data.email === 'string') ? data.email : null;
    return res.status(200).json({ email });
  } catch (err) {
    console.error('lookupEmailByStudentId error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
});
