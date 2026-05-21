import { database, ref, push, serverTimestamp } from '../config/firebase';

const ADSGRAM_SCRIPT = 'https://sad.adsgram.ai/js/sad.min.js';

let sdkLoaded = false;
let loadCallbacks = [];

export const loadAdsGramSDK = () => {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) return resolve(true);
    if (window.AdsGram) {
      sdkLoaded = true;
      return resolve(true);
    }

    loadCallbacks.push({ resolve, reject });

    const script = document.createElement('script');
    script.src = ADSGRAM_SCRIPT;
    script.async = true;
    script.onload = () => {
      sdkLoaded = true;
      loadCallbacks.forEach(cb => cb.resolve(true));
      loadCallbacks = [];
    };
    script.onerror = () => {
      loadCallbacks.forEach(cb => cb.reject(new Error('AdsGram SDK failed to load')));
      loadCallbacks = [];
    };
    document.head.appendChild(script);
  });
};

export const showAdsGramReward = (blockId) => {
  return new Promise((resolve, reject) => {
    if (!window.AdsGram) {
      return reject(new Error('AdsGram SDK not loaded'));
    }

    try {
      const controller = new window.AdsGram({
        blockId: blockId || 'YOUR_BLOCK_ID',
        type: 'reward',
        onReward: () => resolve('rewarded'),
        onError: (err) => reject(err || new Error('AdsGram error')),
      });

      controller.show();
    } catch (err) {
      reject(err);
    }
  });
};

export const logAdsGramImpression = async (userId, status, reward) => {
  try {
    const impressionsRef = ref(database, 'adsgram_impressions');
    await push(impressionsRef, {
      userId,
      provider: 'adsgram',
      status,
      reward,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('Failed to log AdsGram impression:', err);
  }
};
