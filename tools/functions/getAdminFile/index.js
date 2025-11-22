const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// HTTP function to serve admin_files contentBase64 as binary
exports.getAdminFile = functions.https.onRequest(async (req, res) => {
  const docId = req.query.docId;
  if (!docId) return res.status(400).send('docId required');

  try {
    const snap = await admin.firestore().collection('admin_files').doc(docId).get();
    if (!snap.exists) return res.status(404).send('not found');
    const d = snap.data();
    if (!d) return res.status(404).send('not found');

    if (d.contentBase64) {
      const buf = Buffer.from(d.contentBase64, 'base64');
      res.set('Content-Type', d.contentType || 'application/octet-stream');
      res.set('Content-Disposition', `attachment; filename="${d.name || 'file'}"`);
      return res.send(buf);
    }

    // If we don't have base64, but the doc has a Storage path, we can redirect to the download URL
    if (d.url) {
      return res.redirect(d.url);
    }

    return res.status(404).send('no content available');
  } catch (err) {
    console.error('getAdminFile error', err);
    return res.status(500).send('server error');
  }
});
