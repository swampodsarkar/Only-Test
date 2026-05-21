import { database, ref, push, serverTimestamp } from '../config/firebase';

const ADSGRAM_SCRIPT = 'https://sad.adsgram.ai/js/sad.min.js';

let sdkLoaded = false;
let loadCallbacks = [];
let cachedController = null;

export const loadAdsGramSDK = () => {
  return new Promise((resolve, reject) => {
    if (sdkLoaded) return resolve(true);
    if (window.Adsgram) {
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

export const initAdsGram = (blockId) => {
  if (!window.Adsgram) {
    throw new Error('AdsGram SDK not loaded');
  }
  if (!cachedController) {
    cachedController = window.Adsgram.init({ blockId: blockId || '30739' });
  }
  return cachedController;
};

export const showAdsGramReward = (blockId) => {
  const controller = initAdsGram(blockId);
  return controller.show();
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
