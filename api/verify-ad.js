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
    let userId, reward;

    if (req.method === 'GET') {
      userId = req.query.userId;
      reward = parseInt(req.query.reward) || 1;
    } else if (req.method === 'POST') {
      userId = req.body?.userId;
      reward = req.body?.reward || 1;
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!userId) {
      return res.status(200).json({ status: 'ok' });
    }

    const userData = await fbGet(`/users/${userId}`) || {};
    const today = new Date().toISOString().split('T')[0];
    const amount = reward || 1;

    const dailyCount = userData.lastWatchDate === today ? (userData.dailyWatchCount || 0) : 0;
    if (dailyCount >= 30) {
      return res.status(400).json({ error: 'দৈনিক লিমিট পূর্ণ' });
    }

    const lastActive = userData.lastActiveAt || 0;
    if (Date.now() - lastActive < 10000) {
      await new Promise(r => setTimeout(r, 3000));
    }

    const updates = {};

    if (userData.lastWatchDate === today) {
      updates.dailyWatchCount = dailyCount + 1;
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
