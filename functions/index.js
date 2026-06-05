const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

const SENDGRID_API_KEY = functions.config().sendgrid?.key;
const ADMIN_EMAIL = functions.config().admin?.email;
const FROM_EMAIL = functions.config().admin?.from || ADMIN_EMAIL;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key is not configured. Set it with firebase functions:config:set sendgrid.key="YOUR_KEY"');
}

function getMessage(to, subject, text, html) {
  return {
    to,
    from: FROM_EMAIL,
    subject,
    text,
    html
  };
}

exports.sendRegistrationEmail = functions.auth.user().onCreate(async (user) => {
  if (!SENDGRID_API_KEY || !ADMIN_EMAIL) {
    console.warn('Missing SendGrid or admin email config for registration notification.');
    return null;
  }

  const subject = `New TradeHub registration: ${user.email}`;
  const text = `A new TradeHub user has registered.\n\nEmail: ${user.email}\nUID: ${user.uid}\nCreated: ${user.metadata.creationTime}`;
  const html = `<p>A new TradeHub user has registered.</p><ul><li><strong>Email:</strong> ${user.email}</li><li><strong>UID:</strong> ${user.uid}</li><li><strong>Created:</strong> ${user.metadata.creationTime}</li></ul>`;

  const msg = getMessage(ADMIN_EMAIL, subject, text, html);
  return sgMail.send(msg);
});

exports.notifyVisit = functions.https.onRequest(async (req, res) => {
  if (!SENDGRID_API_KEY || !ADMIN_EMAIL) {
    console.warn('Missing SendGrid or admin email config for visit notification.');
    res.status(500).json({ success: false, error: 'Notification config missing' });
    return;
  }

  const payload = req.body || {};
  const subject = `TradeHub visit notification`;
  const text = `A user visited TradeHub.\n\nPath: ${payload.path || 'unknown'}\nReferrer: ${payload.referrer || 'none'}\nUser Agent: ${payload.userAgent || 'unknown'}\nEmail: ${payload.email || 'anonymous'}`;
  const html = `<p>A user visited TradeHub.</p><ul><li><strong>Path:</strong> ${payload.path || 'unknown'}</li><li><strong>Referrer:</strong> ${payload.referrer || 'none'}</li><li><strong>User Agent:</strong> ${payload.userAgent || 'unknown'}</li><li><strong>Email:</strong> ${payload.email || 'anonymous'}</li></ul>`;

  const msg = getMessage(ADMIN_EMAIL, subject, text, html);
  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Visit notify error:', error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});
