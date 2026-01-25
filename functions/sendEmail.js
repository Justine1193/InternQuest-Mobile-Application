/**
 * Email utility used by Cloud Functions.
 *
 * ASSUMPTION (per project requirement):
 *   sendEmail({ to, subject, html }) is available for other functions.
 *
 * This implementation uses nodemailer and Firebase Functions config:
 *   firebase functions:config:set smtp.host="..." smtp.port="587" smtp.user="..." smtp.pass="..." smtp.from="InternQuest <no-reply@yourdomain>"
 *
 * NOTE: Do NOT log passwords or sensitive links.
 */
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getSmtpConfig() {
  const cfg = functions.config() || {};
  const smtp = cfg.smtp || {};

  const host = smtp.host;
  const port = smtp.port ? Number(smtp.port) : undefined;
  const user = smtp.user;
  const pass = smtp.pass;
  const from = smtp.from;

  return { host, port, user, pass, from };
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { host, port, user, pass } = getSmtpConfig();

  if (!host || !port || !user || !pass) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Email service is not configured (missing smtp.host/smtp.port/smtp.user/smtp.pass)."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

/**
 * Send an email.
 * @param {{to: string, subject: string, html: string}} params
 */
async function sendEmail({ to, subject, html }) {
  if (!to || typeof to !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Email 'to' is required.");
  }
  if (!subject || typeof subject !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email 'subject' is required."
    );
  }
  if (!html || typeof html !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Email 'html' is required.");
  }

  const transporter = getTransporter();
  const { from } = getSmtpConfig();

  await transporter.sendMail({
    from: from || "no-reply@internquest.local",
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };

