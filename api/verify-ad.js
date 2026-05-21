const DB_URL = 'https://gen-z-airdrop-default-rtdb.asia-southeast1.firebasedatabase.app';

async function fbGet(path) {
  const res = await fetch(`${DB_URL}${path}.json`);
  return res.json();
}

async function fbUpdate(path, data) {
  await fetch(`${DB_URL}${path}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let userId, adSessionId, reward;

    if (req.method === 'GET') {
      userId = req.query.userId;
      adSessionId = req.query.adSessionId;
      reward = parseInt(req.query.reward) || 1;
    } else if (req.method === 'POST') {
      userId = req.body?.userId;
      adSessionId = req.body?.adSessionId;
      reward = req.body?.reward || 1;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!userId) {
      return res.status(200).json({ status: 'ok' });
    }

    if (adSessionId) {
      const session = await fbGet(`/ad_sessions/${adSessionId}`);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'pending') {
        return res.status(200).json({ status: 'already_processed' });
      }

      if (session.userId !== userId) {
        return res.status(403).json({ error: 'User mismatch' });
      }

      const age = Date.now() - session.createdAt;
      if (age > 5 * 60 * 1000) {
        return res.status(400).json({ error: 'Session expired' });
      }

      await fbUpdate(`/ad_sessions/${adSessionId}`, {
        status: 'verified',
        verifiedAt: Date.now(),
      });
    }

    const userData = await fbGet(`/users/${userId}`) || {};
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

    await fbUpdate(`/users/${userId}`, updates);

    return res.status(200).json({
      status: 'verified',
      userId,
      amount,
    });

  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: err.message });
  }
}
