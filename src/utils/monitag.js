import { database, ref, push, serverTimestamp } from '../config/firebase';

const MONITAG_PUBLISHER_ID = 'YOUR_PUBLISHER_ID_HERE';
const MONITAG_SCRIPT = `https://cdn.monitag.com/sdk.js?p=${MONITAG_PUBLISHER_ID}`;

let sdkLoaded = false;
let loadCallbacks = [];

export const loadMonitagSDK = () => {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) return resolve(true);
    if (window.monitag && window.monitag.cmd) {
      sdkLoaded = true;
      return resolve(true);
    }

    loadCallbacks.push({ resolve, reject });

    const script = document.createElement('script');
    script.src = MONITAG_SCRIPT;
    script.async = true;
    script.onload = () => {
      sdkLoaded = true;
      loadCallbacks.forEach(cb => cb.resolve(true));
      loadCallbacks = [];
    };
    script.onerror = () => {
      loadCallbacks.forEach(cb => cb.reject(new Error('Monetag SDK failed to load')));
      loadCallbacks = [];
    };
    document.head.appendChild(script);
  });
};

export const showRewardedAd = () => {
  return new Promise((resolve, reject) => {
    if (!window.monitag || !window.monitag.cmd) {
      return reject(new Error('Monetag SDK not loaded'));
    }

    window.monitag.cmd.push(() => {
      try {
        window.monitag.showRewardedAd({
          onReward: () => resolve('rewarded'),
          onComplete: () => resolve('completed'),
          onDismiss: () => reject(new Error('Ad dismissed')),
          onError: (err) => reject(err || new Error('Ad error')),
        });
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const logAdImpression = async (userId, status, reward) => {
  try {
    const impressionsRef = ref(database, 'ad_impressions');
    await push(impressionsRef, {
      userId,
      provider: 'monetag',
      status,
      reward,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('Failed to log impression:', err);
  }
};
