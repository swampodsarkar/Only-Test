const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

const SECRET_TOKEN = functions.config().webhook?.secret || 'kamai-bd-webhook-secret-dev';

const verifySignature = (req) => {
  const signature = req.headers['x-adsgram-signature'] || req.headers['x-monetag-signature'] || '';
  const timestamp = req.headers['x-timestamp'] || '';
  const body = JSON.stringify(req.body);
  const crypto = require('crypto');
  const expected = crypto.createHmac('sha256', SECRET_TOKEN)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  return signature === expected;
};

const validateRequest = (req) => {
  if (!req.body || !req.body.userId) {
    throw new Error('Missing userId');
  }
  if (!req.body.adSessionId) {
    throw new Error('Missing adSessionId');
  }
};

exports.adsgramWebhook = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateRequest(req);
    const { userId, adSessionId, reward, provider } = req.body;

    const sessionRef = db.ref(`ad_sessions/${adSessionId}`);
    const sessionSnap = await sessionRef.once('value');

    if (!sessionSnap.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionSnap.val();

    if (session.status === 'verified') {
      return res.status(200).json({ status: 'already_verified' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid session status' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    const updates = {};

    const userRef = db.ref(`users/${userId}`);
    const userSnap = await userRef.once('value');
    const userData = userSnap.val() || {};

    const today = new Date().toISOString().split('T')[0];
    const amount = reward || 1;

    if (userData.lastWatchDate === today) {
      updates[`users/${userId}/dailyWatchCount`] = (userData.dailyWatchCount || 0) + 1;
    } else {
      updates[`users/${userId}/dailyWatchCount`] = 1;
      updates[`users/${userId}/lastWatchDate`] = today;
    }

    const weeklyKey = `weeklyEarned/${today}`;
    updates[`users/${userId}/${weeklyKey}`] = (userData.weeklyEarned?.[today] || 0) + amount;
    updates[`users/${userId}/balance`] = (userData.balance || 0) + amount;
    updates[`users/${userId}/totalEarned`] = (userData.totalEarned || 0) + amount;
    updates[`users/${userId}/lastActiveAt`] = Date.now();

    updates[`ad_sessions/${adSessionId}/status`] = 'verified';
    updates[`ad_sessions/${adSessionId}/verifiedAt`] = Date.now();
    updates[`ad_sessions/${adSessionId}/provider`] = provider || 'unknown';

    await db.ref().update(updates);

    return res.status(200).json({
      status: 'verified',
      userId,
      amount,
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
});

exports.monetagWebhook = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    validateRequest(req);
    const { userId, adSessionId, reward } = req.body;

    const sessionRef = db.ref(`ad_sessions/${adSessionId}`);
    const sessionSnap = await sessionRef.once('value');

    if (!sessionSnap.exists()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionSnap.val();

    if (session.status === 'verified') {
      return res.status(200).json({ status: 'already_verified' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid session status' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    await sessionRef.update({ status: 'verified', verifiedAt: Date.now() });

    const userRef = db.ref(`users/${userId}`);
    const userSnap = await userRef.once('value');
    const userData = userSnap.val() || {};

    const today = new Date().toISOString().split('T')[0];
    const amount = reward || 1;

    const updates = {};

    if (userData.lastWatchDate === today) {
      updates.dailyWatchCount = (userData.dailyWatchCount || 0) + 1;
    } else {
      updates.dailyWatchCount = 1;
      updates.lastWatchDate = today;
    }

    updates.balance = (userData.balance || 0) + amount;
    updates.totalEarned = (userData.totalEarned || 0) + amount;
    updates.lastActiveAt = Date.now();

    await userRef.update(updates);

    return res.status(200).json({
      status: 'verified',
      userId,
      amount,
    });

  } catch (err) {
    console.error('Monetag webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
});
