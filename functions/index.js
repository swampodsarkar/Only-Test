const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

const validateSession = async (sessionId, userId) => {
  const sessionRef = db.ref(`ad_sessions/${sessionId}`);
  const sessionSnap = await sessionRef.once('value');

  if (!sessionSnap.exists()) {
    throw new Error('Session not found');
  }

  const session = sessionSnap.val();

  if (session.status !== 'pending') {
    throw new Error('Session already processed');
  }

  if (session.userId !== userId) {
    throw new Error('User mismatch');
  }

  const age = Date.now() - session.createdAt;
  if (age > 5 * 60 * 1000) {
    throw new Error('Session expired');
  }

  return session;
};

const creditUser = async (userId, reward) => {
  const userRef = db.ref(`users/${userId}`);
  const userSnap = await userRef.once('value');
  const userData = userSnap.val() || {};

  const today = new Date().toISOString().split('T')[0];
  const amount = reward || 1;

  const updates = {};

  if (userData.lastWatchDate === today) {
    updates[`users/${userId}/dailyWatchCount`] = (userData.dailyWatchCount || 0) + 1;
  } else {
    updates[`users/${userId}/dailyWatchCount`] = 1;
    updates[`users/${userId}/lastWatchDate`] = today;
  }

  updates[`users/${userId}/balance`] = (userData.balance || 0) + amount;
  updates[`users/${userId}/totalEarned`] = (userData.totalEarned || 0) + amount;
  updates[`users/${userId}/lastActiveAt`] = Date.now();

  await db.ref().update(updates);
  return { userId, amount };
};

exports.adsgramWebhook = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    let userId, adSessionId, reward;

    if (req.method === 'GET') {
      userId = req.query.userId;
      adSessionId = req.query.adSessionId;
      reward = parseInt(req.query.reward) || 1;
    } else if (req.method === 'POST') {
      userId = req.body.userId;
      adSessionId = req.body.adSessionId;
      reward = req.body.reward || 1;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!userId) {
      return res.status(200).send('OK');
    }

    if (adSessionId) {
      await validateSession(adSessionId, userId);
    }

    const result = await creditUser(userId, reward);

    if (adSessionId) {
      await db.ref(`ad_sessions/${adSessionId}/status`).set('verified');
      await db.ref(`ad_sessions/${adSessionId}/verifiedAt`).set(Date.now());
    }

    return res.status(200).json({ status: 'verified', ...result });

  } catch (err) {
    console.error('AdsGram webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
});

exports.monetagWebhook = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const { userId, adSessionId, reward } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (adSessionId) {
      await validateSession(adSessionId, userId);
    }

    const result = await creditUser(userId, reward || 1);

    if (adSessionId) {
      await db.ref(`ad_sessions/${adSessionId}/status`).set('verified');
      await db.ref(`ad_sessions/${adSessionId}/verifiedAt`).set(Date.now());
    }

    return res.status(200).json({ status: 'verified', ...result });

  } catch (err) {
    console.error('Monetag webhook error:', err);
    return res.status(400).json({ error: err.message });
  }
});
