import { database, ref, get, update } from '../config/firebase';
import { HiSpeakerphone, HiVideoCamera, HiCheck, HiShare, HiUser } from 'react-icons/hi';

export const settings = {
  minWithdraw: 500,
  exchangeRate: 10,
  dailyWatchLimit: 20,
  watchReward: 10,
  referralBonusReferrer: 100,
  referralBonusNewUser: 50,
  dailyBonusBase: 30,
};

export const TASKS = [
  {
    id: 'task_join_channel',
    title: 'Telegram চ্যানেল জয়েন করুন',
    reward: 50,
    icon: HiSpeakerphone,
    description: 'আমাদের Telegram চ্যানেলে জয়েন করুন এবং 50 কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_adsgram',
    title: 'AdsGram Task দেখুন',
    reward: 100,
    icon: HiVideoCamera,
    description: 'AdsGram এ একটি টাস্ক সম্পন্ন করুন এবং 100 কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_daily_checkin',
    title: 'Daily Check-in',
    reward: 20,
    icon: HiCheck,
    description: 'প্রতিদিন চেক-ইন করুন এবং 20 কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_share',
    title: 'Share App to 1 Friend',
    reward: 200,
    icon: HiShare,
    description: 'অ্যাপটি একজন বন্ধুর সাথে শেয়ার করুন এবং 200 কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_profile',
    title: 'Complete Profile',
    reward: 30,
    icon: HiUser,
    description: 'আপনার প্রোফাইল সম্পূর্ণ করুন এবং 30 কয়েন উপার্জন করুন!',
  },
];

export const formatCoins = (amount) => {
  return amount.toLocaleString('en-US');
};

export const coinsToBDT = (coins) => {
  return (coins / settings.exchangeRate).toFixed(2);
};

export const getTodayStr = () => {
  return new Date().toISOString().split('T')[0];
};

export const checkDailyCheckin = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}/tasksCompleted`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const tasks = snapshot.val();
      const todayKey = `task_daily_checkin_${getTodayStr()}`;
      return !!tasks[todayKey];
    }
    return false;
  } catch {
    return false;
  }
};

export const addReward = async (userId, amount, field = 'balance') => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const updates = {};
      updates[field] = (data[field] || 0) + amount;
      updates.totalEarned = (data.totalEarned || 0) + amount;
      updates.lastActiveAt = Date.now();
      await update(userRef, updates);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
